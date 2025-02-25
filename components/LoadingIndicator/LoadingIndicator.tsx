import { BarLoader } from "react-spinners";

type Props = {
	fullHeightAndWidth?: boolean;
};

const LoadingIndicator = ({ fullHeightAndWidth }: Props) => {
	const classes = ["place-items-center", "grid"];
	if (fullHeightAndWidth) {
		classes.push("h-full w-full");
	}
	return (
		<div className={classes.join(" ")}>
			<BarLoader color="white" />
		</div>
	);
};

export default LoadingIndicator;
