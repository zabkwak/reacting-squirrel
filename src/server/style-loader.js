import Processor from 'combine-styles-processor';
import { getOptions } from 'loader-utils';
import md5 from 'md5';

export default async function (content) {
    const callback = this.async();
    const key = md5(this.resourcePath);
    const { outDir } = getOptions(this);
    const outFile = `${outDir}/rs-tmp-${key}.css`;
    const processor = new Processor(
        [this.resourcePath], outFile,
    );
    try {
        await processor.process();
    } catch (e) {
        callback(e);
        return;
    }
    callback(null, '');
}
