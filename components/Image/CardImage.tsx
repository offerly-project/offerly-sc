import { Card } from "../ui/card";

type Props = {
	src: string;
	alt: string;
	className?: string;
	styles?: React.CSSProperties;
};

const CardImage = ({ src, alt, className, styles = {} }: Props) => {
	return (
		<div
			className={className}
			style={{ overflow: "hidden", borderRadius: 10, ...styles }}
		>
			{src ? (
				<img className="h-full w-full" src={src} alt="logo" style={styles} />
			) : (
				<Card className="h-full w-full grid place-items-center">
					<p className="font-bold text-2xl">{alt}</p>
				</Card>
			)}
		</div>
	);
};

export default CardImage;
