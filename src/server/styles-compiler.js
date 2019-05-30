import sass from 'node-sass';
import async from 'async';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import uniqid from 'uniqid';
import uglifyCSS from 'uglifycss';

export default class StylesCompiler {

    _dirs = [];

    _outDir = null;

    _mergedFileName = null;

    _unlinkIgnoreFiles = null;

    constructor(dirs, outDir, mergedFileName = 'rs-tmp.merged.css', unlinkIgnoreFiles = []) {
        this._dirs = dirs;
        this._outDir = outDir;
        this._mergedFileName = mergedFileName;
        this._unlinkIgnoreFiles = unlinkIgnoreFiles;
    }

    compile(cb) {
        fs.exists(this._outDir, (exists) => {
            if (exists) {
                this._compile(cb);
                return;
            }
            mkdirp(this._outDir, (err) => {
                if (err) {
                    cb(err);
                    return;
                }
                this._compile(cb);
            });
        });
    }

    _compile(cb) {
        async.eachSeries(this._dirs, (dir, callback) => {
            this._scanDir(dir, ['scss', 'css'], (err, files) => {
                if (err) {
                    callback(err);
                    return;
                }
                this._processFiles(files, callback);
            });
        }, (err) => {
            if (err) {
                cb(err);
                return;
            }
            fs.readdir(this._outDir, (err, files) => {
                if (err) {
                    cb(err);
                    return;
                }
                const list = files
                    .filter(file => file.indexOf('rs-tmp') === 0 && file !== this._mergedFileName && !this._unlinkIgnoreFiles.includes(file))
                    .map(f => `${this._outDir}/${f}`);
                const result = uglifyCSS.processFiles(list);
                fs.writeFile(`${this._outDir}/${this._mergedFileName}`, result, (err) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    async.each(list, (file, callback) => {
                        fs.unlink(file, callback);
                    }, cb);
                });
            });
        });
    }

    _scanDir(dir, ext, cb) {
        if (!(ext instanceof Array)) {
            ext = [ext];
        }
        ext = ext.map((e) => {
            return e.indexOf('.') === 0 ? e : `.${e}`;
        });
        let out = [];
        fs.readdir(dir, (err, files) => {
            if (err) {
                cb(err);
                return;
            }
            async.each(files, (file, callback) => {
                const p = `${dir}/${file}`;
                const stat = fs.statSync(p);
                if (stat.isDirectory()) {
                    this._scanDir(p, ext, (err, list) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        out = out.concat(list);
                        callback();
                    });
                    return;
                }
                if (ext.includes(path.extname(p))) {
                    out.push(p);
                }
                callback();
            }, (err) => {
                if (err) {
                    cb(err);
                    return;
                }
                cb(null, out);
            });
        });
    }

    _processFiles(files, cb) {
        async.each(files, (file, callback) => {
            const ext = path.extname(file);
            const dest = `${this._outDir}/rs-tmp_${uniqid()}.css`;
            switch (ext) {
                case '.scss':
                    fs.readFile(file, (err, buffer) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        const data = buffer.toString().replace(/@import(.*)~/g, '@import$1./node_modules/');
                        sass.render({
                            data,
                        }, (err, result) => {
                            if (err) {
                                callback(err);
                                return;
                            }
                            fs.writeFile(dest, result.css, callback);
                        });
                    });

                    return;
                case '.css':
                    if (path.dirname(file) === this._outDir && file.indexOf('rs-tmp') >= 0) {
                        callback();
                        return;
                    }
                    fs.copyFile(file, dest, callback);
                    return;
                default:
                    callback(`File extension ${ext} not supported.`);
            }
        }, cb);
    }
}
