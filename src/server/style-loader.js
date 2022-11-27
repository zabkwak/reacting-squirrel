import Processor from 'combine-styles-processor';
import md5 from 'md5';

export default async function styleLoader(content) {
	const callback = this.async();
	const key = md5(this.resourcePath);
	const { outDir } = this.getOptions();
	const outFile = `${outDir}/rs-tmp-${key}.css`;
	const processor = new Processor(
		[this.resourcePath],
		outFile,
	);
	try {
		await processor.process();
	} catch (e) {
		callback(e);
		return;
	}
	callback(null, '');
}
