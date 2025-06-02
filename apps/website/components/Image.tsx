export default function Image(props: {
	src: string;
	alt: string;
	optimize: {
		width?: number;
		height?: number;
	};
	id?: string;
	className?: string;
}) {
	const src = props.src.includes("ipfs.nouns.gg")
		? `${props.src}?img-height=${props.optimize.height}&img-width=${props.optimize.width}&img-onerror=redirect`
		: props.src;

	return (
		<img src={src} alt={props.alt} className={props.className} id={props.id} />
	);
}
