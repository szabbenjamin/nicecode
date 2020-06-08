import * as request from 'request-promise';
import { exec } from 'child_process';
import {CONFIG} from "../config";
import FileHandler from "./file";

export class Common {
    public static request(uri : string, headers : object|null = null, data = null) : Promise<any> {
        if (!headers) {
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
                'Content-Type' : 'application/x-www-form-urlencoded'
            };
        }

        const options : object = {
            uri: uri,
            headers: headers,
            method: data ? 'POST' : 'GET'
        };

        if (data) {
            // @ts-ignore
            options['formData'] = data;
        }

        return request(options)
    }

}
