import * as mysql from "mysql";
import {CONFIG} from "../config";

export class DBConn {
    private conn : mysql.Connection;
    private isAlreadyConnected = false;

    constructor() {
        this.conn = mysql.createConnection({
            host: CONFIG.mysql.host,
            user: CONFIG.mysql.user,
            password: CONFIG.mysql.pass,
            database: CONFIG.mysql.db
        });
    }

    public query (query : string, parameters : Array<string|number> = []) : Promise<any> {
        return new Promise(data => {
            const q = () => {
                if (parameters.length) {
                    this.conn.query(query, parameters, (err, results, fields) => {
                        if (err) {
                            console.log(err);
                        }
                        data(results);
                    });
                }
                else {
                    this.conn.query(query, (err, results, fields) => {
                        if (err) {
                            console.log(err);
                        }
                        data(results);
                    });
                }
            };

            if (this.isAlreadyConnected) {
                q();
            }
            else {
                this.isAlreadyConnected = true;
                this.conn.connect((connErr) => {
                    if (connErr) {
                        throw new Error(String(connErr));
                    }
                    q();
                });
            }
        });
    }

    public end() : void {
        this.conn.end();
    }
}