import * as fs from 'fs';

class FileHandler {
    public static readFile (filename : string) : string {
        return fs.readFileSync(filename).toString();
    }

    public static readFileToBase64 (filename : string) : string {
        return fs.readFileSync(filename, { encoding: 'base64' }).toString();
    }

    public static readJsonFile (filename : string) : object {
        const filecontent = FileHandler.readFile(filename);
        try {
            return JSON.parse(filecontent);
        }
        catch (e) {
            return {};
        }
    }

    public static writeFile (filename : string, input : string) : void {
        if (typeof input !== 'string') {
            throw new Error('Input type is invalid' + input);
        }
        fs.writeFileSync(filename, input);
    }

    public static appendFile (filename : string, input : string) : void {
        if (typeof input !== 'string') {
            throw new Error('Input type is invalid' + input);
        }
        fs.appendFile(filename, input + '\r\n', () => {});
    }

    public static writeJsonFile (filename : string, input : object) : void {
        if (typeof input !== 'object') {
            throw new Error('Input type is invalid' + input);
        }
        FileHandler.writeFile(filename, JSON.stringify(input));
    }

    public static readDir(path : string) : Array<string> {
        return fs.readdirSync(path);
    }
}

export default FileHandler;
