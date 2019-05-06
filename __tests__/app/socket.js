import React from 'react';
import {
    Page,
} from '../../src/app';

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            resolve(reader.result.split(',')[1]);
        };
        reader.onerror = function (error) {
            reject(error);
        };

    });
}

export default class Socket extends Page {

    async componentDidMount() {
        super.componentDidMount();
        const data = await this.call('socket.test', { buffer: str2ab('ěšč') });
        // console.log(JSON.parse(JSON.stringify({ buffer: str2ab('buffer') })));
        console.log(ab2str(data.buffer));
    }

    render() {
        return (
            <div>
                <h1>SOCKET TEST</h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <input
                        type="file"
                        name="file"
                        multiple={false}
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            await this.call('socket.file', { file, name: file.name });
                        }}
                    />
                </form>
            </div>
        );
    }
}
