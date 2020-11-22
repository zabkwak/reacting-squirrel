/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
/*
const code = () => {
	var req = new XMLHttpRequest();
	req.addEventListener(
		'progress',
		function (e) {
			if (e.lengthComputable) {
				var t = e.loaded / e.total;
				document.getElementById('rs-bundle-progress').textContent = Math.round(100 * t) + '%';
			}
		},
		false
	);
	req.addEventListener(
		'load',
		function (e) {
			var t = e.target,
				n = document.createElement('script');
			n.id = 'bundle';
			// n.innerHTML = t.responseText;
			n.src = '${this._createPath(bundle, version)}';
			document.getElementsByTagName('head')[0].appendChild(n);
		},
		false
	),
		req.open('GET', '${this._createPath(bundle, version)}'),
		req.send();
};
*/
/**
 * Base layout component for default html code rendered on the server-side.
 */
export default class Layout extends Component {

	static propTypes = {
		title: PropTypes.string.isRequired,
		initialData: PropTypes.any.isRequired,
		url: PropTypes.shape({
			protocol: PropTypes.string.isRequired,
			hostname: PropTypes.string.isRequired,
			pathname: PropTypes.string.isRequired,
		}).isRequired,
		// eslint-disable-next-line react/no-unused-prop-types
		user: PropTypes.any,
		scripts: PropTypes.arrayOf(PropTypes.string),
		styles: PropTypes.arrayOf(PropTypes.string),
		version: PropTypes.string.isRequired,
		bundle: PropTypes.string.isRequired,
		charSet: PropTypes.string,
		lang: PropTypes.string,
		getText: PropTypes.func.isRequired,
		nonce: PropTypes.string.isRequired,
		componentWrappers: PropTypes.arrayOf(PropTypes.string),
	};

	static defaultProps = {
		user: null,
		scripts: [],
		styles: [],
		charSet: 'UTF-8',
		lang: 'en',
		componentWrappers: [],
	};

	/**
	 * Renders the base html. This method shouldn't be overriden.
	 */
	render() {
		const { lang } = this.props;
		return (
			<html lang={lang}>
				{this.renderHead()}
				{this.renderBody()}
			</html>
		);
	}

	renderHead() {
		const {
			title, scripts, styles, version, charSet, bundle,
		} = this.props;
		return (
			<head>
				<meta charSet={charSet} />
				{this.renderMeta()}
				<title>{title}</title>
				{scripts.map((s) => <script key={s} src={this._createPath(s, version)} type="text/javascript" />)}
				<script
					type="text/javascript"
					dangerouslySetInnerHTML={{
						// eslint-disable-next-line max-len
						__html: `var req=new XMLHttpRequest;req.addEventListener("progress",function(e){if(e.lengthComputable){var t=e.loaded/e.total;document.getElementById("rs-bundle-progress").textContent=Math.round(100*t)+"%"}},!1),req.addEventListener("load",function(e){e.target;var t=document.createElement("script");t.id="bundle",t.src="${this._createPath(bundle, version)}",document.getElementsByTagName("head")[0].appendChild(t)},!1),req.open("GET","${this._createPath(bundle, version)}"),req.send();`,
					}}
				/>
				{styles.map((s) => <link key={s} href={this._createPath(s, version)} rel="stylesheet" />)}
			</head>
		);
	}

	renderBody() {
		return (
			<body>
				{this.renderContainer()}
				{this.renderComponentWrappers()}
				{this.renderBundleData()}
			</body>
		);
	}

	renderBundleData() {
		const {
			initialData,
		} = this.props;
		return (
			<>
				<script type="text/plain" id="initial-data" data={JSON.stringify(initialData)} />
				{/* <script type="text/javascript" src={this._createPath(bundle, version)} /> */}
			</>
		);
	}

	/**
	 * Renders the container of the website.
	 */
	renderContainer() {
		return (
			<div id="container">
				<div id="content">
					{this.renderLoader()}
				</div>
			</div>
		);
	}

	renderComponentWrappers() {
		const { componentWrappers } = this.props;
		return (
			<>
				{
					componentWrappers.map((id) => <div id={id} key={id} />)
				}
			</>
		);
	}

	renderLoader() {
		return (
			<div id="rs-main-loader">
				<img
					src="data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ibGRzLXNwaW5uZXIiIHdpZHRoPSIxMDBweCIgaGVpZ2h0PSIxMDBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7IGJhY2tncm91bmQ6IG5vbmU7Ij48ZyB0cmFuc2Zvcm09InJvdGF0ZSgwIDUwIDUwKSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICA8cmVjdCB4PSI0NiIgeT0iNSIgcng9IjkuMjAwMDAwMDAwMDAwMDAxIiByeT0iMSIgd2lkdGg9IjgiIGhlaWdodD0iMjAiIGZpbGw9IiMxZDBlMGIiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjkxNjY2NjY2NjY2NjY2NjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgzMCA1MCA1MCkiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPiAgPHJlY3QgeD0iNDYiIHk9IjUiIHJ4PSI5LjIwMDAwMDAwMDAwMDAwMSIgcnk9IjEiIHdpZHRoPSI4IiBoZWlnaHQ9IjIwIiBmaWxsPSIjMWQwZTBiIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC44MzMzMzMzMzMzMzMzMzM0cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoNjAgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gIDxyZWN0IHg9IjQ2IiB5PSI1IiByeD0iOS4yMDAwMDAwMDAwMDAwMDEiIHJ5PSIxIiB3aWR0aD0iOCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFkMGUwYiIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuNzVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSg5MCA1MCA1MCkiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPiAgPHJlY3QgeD0iNDYiIHk9IjUiIHJ4PSI5LjIwMDAwMDAwMDAwMDAwMSIgcnk9IjEiIHdpZHRoPSI4IiBoZWlnaHQ9IjIwIiBmaWxsPSIjMWQwZTBiIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC42NjY2NjY2NjY2NjY2NjY2cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMTIwIDUwIDUwKSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICA8cmVjdCB4PSI0NiIgeT0iNSIgcng9IjkuMjAwMDAwMDAwMDAwMDAxIiByeT0iMSIgd2lkdGg9IjgiIGhlaWdodD0iMjAiIGZpbGw9IiMxZDBlMGIiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjU4MzMzMzMzMzMzMzMzMzRzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgxNTAgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gIDxyZWN0IHg9IjQ2IiB5PSI1IiByeD0iOS4yMDAwMDAwMDAwMDAwMDEiIHJ5PSIxIiB3aWR0aD0iOCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFkMGUwYiIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuNXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij48L2FuaW1hdGU+ICA8L3JlY3Q+PC9nPjxnIHRyYW5zZm9ybT0icm90YXRlKDE4MCA1MCA1MCkiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPiAgPHJlY3QgeD0iNDYiIHk9IjUiIHJ4PSI5LjIwMDAwMDAwMDAwMDAwMSIgcnk9IjEiIHdpZHRoPSI4IiBoZWlnaHQ9IjIwIiBmaWxsPSIjMWQwZTBiIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC40MTY2NjY2NjY2NjY2NjY3cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMjEwIDUwIDUwKSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICA8cmVjdCB4PSI0NiIgeT0iNSIgcng9IjkuMjAwMDAwMDAwMDAwMDAxIiByeT0iMSIgd2lkdGg9IjgiIGhlaWdodD0iMjAiIGZpbGw9IiMxZDBlMGIiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjMzMzMzMzMzMzMzMzMzMzNzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgyNDAgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gIDxyZWN0IHg9IjQ2IiB5PSI1IiByeD0iOS4yMDAwMDAwMDAwMDAwMDEiIHJ5PSIxIiB3aWR0aD0iOCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFkMGUwYiIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuMjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgyNzAgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gIDxyZWN0IHg9IjQ2IiB5PSI1IiByeD0iOS4yMDAwMDAwMDAwMDAwMDEiIHJ5PSIxIiB3aWR0aD0iOCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFkMGUwYiIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuMTY2NjY2NjY2NjY2NjY2NjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgzMDAgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gIDxyZWN0IHg9IjQ2IiB5PSI1IiByeD0iOS4yMDAwMDAwMDAwMDAwMDEiIHJ5PSIxIiB3aWR0aD0iOCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFkMGUwYiIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuMDgzMzMzMzMzMzMzMzMzMzNzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgzMzAgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4gIDxyZWN0IHg9IjQ2IiB5PSI1IiByeD0iOS4yMDAwMDAwMDAwMDAwMDEiIHJ5PSIxIiB3aWR0aD0iOCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFkMGUwYiIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+ICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iMHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij48L2FuaW1hdGU+ICA8L3JlY3Q+PC9nPjwvc3ZnPg=="
					alt="loading"
				/>
				<span id="rs-bundle-progress">0%</span>
			</div>
		);
	}

	renderMeta() {
		const { nonce } = this.props;
		return (
			<>
				<meta property="csp-nonce" content={nonce} />
			</>
		);
	}

	getText(key, ...args) {
		const { getText } = this.props;
		return getText(key, ...args);
	}

	_createPath(path, version) {
		// TODO use url module?
		return `${path}${path.indexOf('?') >= 0 ? '&' : '?'}v=${version}`;
	}
}
