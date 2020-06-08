import {CONFIG} from "./config";
import { resolve } from "path";
import { readdir } from "fs/promises";
import * as im from "imagemagick";
import {Common} from "./lib/common";
import {exec} from "child_process";
import {DBConn} from "./lib/dbconn";

export class Scanner {
    private dbconn : DBConn;
    private files : Array<string> = [];

    public constructor() {
        this.dbconn = new DBConn();
        this.load();
    }

    /**
     * Csekkoljuk a fájlokat
     */
    private async load() {
        for await (const f of this.getFiles(CONFIG.rootPath)) {
            this.files.push(f);
        }
        console.log('All files', this.files.length);
        this.getData();
    }


    /**
     * A begyűjtött fájlokat feldolgozzuk
     */
    private getData() {
        // Ha kiürült a queue akkor kilépünk
        if (!this.files.length) {
            console.log('Finished.');

            // DB-re várni kell
            setTimeout(() => {
                this.dbconn.end();
            }, 2 * 1000);
            return;
        }

        // A soronkövetkező fájl
        const file = this.files.pop();

        // ne legyen thumbnail véletlenül sem
        if (file.indexOf('_thumb.jpg') === -1) {
            // Létezik-e már felvíve ez a fájl?
            this.dbconn.query(`select * from images where file = ?`, [file]).then(response => {
                if (!response.length) {
                    console.log('new file', file);
                    // Ha nem létezik beszúrjuk csak a filepath-t
                    this.dbconn.query(`insert into images (file) values (?)`, [
                        file
                    ]).then(r => {
                        // beszúrást követően increment id alapján meghatározzuk a thumbnail-t
                        const thumb = `${CONFIG.thumbPath}/${r.insertId}.jpg`;

                        // Ha kép kiolvassuk a geolokációját és átméretezzük
                        if (file.indexOf('.jpg') !== -1) {
                            this.getLocation(file, location => {
                                this.dbconn.query(`update images set city=?, address=?, created=?, thumb=? where file=?`, [
                                    location.city, location.address, location.created, thumb, file
                                ]);
                            });

                            im.crop({
                                srcPath: file,
                                dstPath: thumb,
                                width: 300,
                                height: 300,
                                quality: 0.8,
                                gravity: "North"
                            }, () => {
                                this.getData();
                            });
                        }
                        // Ha videó vesszük az 5-ik másodperc első képkockáját és azt állítjuk be thumbnail-nek
                        else if (file.indexOf('.mp4') !== -1) {
                            exec(`ffmpeg -ss 00:00:05 -i ${file} -vframes 1 -q:v 2 ${thumb}`, () => {
                                im.crop({
                                    srcPath: thumb,
                                    dstPath: thumb,
                                    width: 300,
                                    height: 300,
                                    quality: 0.8,
                                    gravity: "North"
                                }, () => {
                                    this.getData();
                                });
                            });
                            exec(`ffprobe -v quiet ${file} -print_format json -show_entries stream=index,codec_type:stream_tags=creation_time:format_tags=creation_time`, (err, out) => {
                                let creation_time = null;
                                // Ha nem lehet megtudni a fájlból a készítés dátumát akkor azt nem mentjük el
                                // TODO: meg kéne nézni, hogy amúgy miért nem tudjuk meg
                                if (out) {
                                    const videoData = JSON.parse(out);
                                    creation_time = videoData.format.tags.creation_time;
                                }
                                this.dbconn.query(`update images set created=?, thumb=? where file=?`, [
                                    creation_time, thumb, file
                                ]);
                            });
                        }
                        else {
                            this.getData();
                        }
                    });
                }
                else {
                    this.getData();
                }
            });
        }
        else {
            this.getData();
        }
    }

    /**
     * Végigmegyünk a paraméterben megadott mappa fájljain
     * @param dir
     */
    private async * getFiles(dir : string) : AsyncIterableIterator<string> {
        const dirents = await readdir(dir, { withFileTypes: true });
        for (const dirent of dirents) {
            const res = resolve(dir, dirent.name);
            if (dirent.isDirectory()) {
                yield* this.getFiles(res);
            } else {
                yield res;
            }
        }
    }

    /**
     * Kiolvassuk a kép metaadatait
     * @param file
     * @param cb
     */
    private loadMetadata(file : string, cb : (metadata) => void) : void {
        im.readMetadata(file, (err, metadata) => {
            if (err) {
                throw err;
            }

            cb(metadata);
        });
    }

    /**
     * A metaadatokból a GPS adatokat feldolgozzuk és megnézzük a várost, illetve pontos címet
     * @param metadata
     * @param cb
     */
    private getGPSData(metadata, cb : (data : {lat : number, lon : number, city : string, address : string} | null) => void) : void {
        if (typeof metadata.exif === 'undefined') {
            cb(null);
            return;
        }

        if (typeof metadata.exif.gpsLatitude === 'undefined') {
            cb(null);
            return;
        }

        const _lat = metadata.exif.gpsLatitude.split(',').map(element => {
            let blocks = element.trim().split('/');
            return blocks[0] / blocks[1];
        });

        const _lon = metadata.exif.gpsLongitude.split(',').map(element => {
            let blocks = element.trim().split('/');
            return blocks[0] / blocks[1];
        });

        const lat = _lat[0] + _lat[1] / 60 + _lat[2] / 3600,
            lon = _lon[0] + _lon[1] / 60 + _lon[2] / 3600;

        Common.request(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${CONFIG.opencagedataApi}`).then(response => {
            const opencagedata = JSON.parse(response);

            cb({
                lat: _lat[0] + _lat[1] / 60 + _lat[2] / 3600,
                lon: _lon[0] + _lon[1] / 60 + _lon[2] / 3600,
                city: opencagedata.results[0].components.city,
                address: opencagedata.results[0].formatted
            });
        });

    }

    /**
     * Kiolvassuk a fájl helyadatait
     * @param file
     * @param cb
     */
    private getLocation(file : string, cb : (data : {city : string, address : string, created : any}) => void) : void {
        this.loadMetadata(file, metadata => {
            this.getGPSData(metadata, data => {
                cb({
                    city: data === null ? null : data.city,
                    address: data === null ? null : data.address,
                    created: metadata.exif.dateTimeOriginal
                })
            });
        });
    }
}