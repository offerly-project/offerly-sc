import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

type Props = {
	children: string;
	className?: string;
};

const MarkdownPreview = ({ children, className }: Props) => {
	return (
		<div className={"md-preview"}>
			<Markdown className={className} rehypePlugins={[rehypeRaw]}>
				{children}
			</Markdown>
		</div>
	);
};

export default MarkdownPreview;
