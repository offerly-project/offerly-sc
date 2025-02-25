import "@mdxeditor/editor/style.css";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { MDColorCommand } from "./MDColorCommand";
type Props = {
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
	error?: string;
};

const MarkdownEditor = ({
	placeholder,
	value,
	onChange,
	className,
	error,
}: Props) => {
	const label = useMemo(() => {
		const label = [placeholder];
		if (value) {
			label.push("Filled");
		} else {
			label.push("Empty");
		}
		return label.join(" : ");
	}, [value, placeholder]);
	const [state, setState] = useState(value || "");
	const [open, setOpen] = useState(false);
	const onSave = () => {
		setOpen(false);
		onChange?.(state);
	};
	return (
		<Dialog
			open={open}
			onOpenChange={(val) => {
				if (!val) {
					setState(value || "");
				}
				setOpen(val);
			}}
		>
			<DialogTrigger>
				<div className="w-full">
					<Button variant={"outline"} className={"w-full " + className}>
						{label}
					</Button>
					{error && <p className="text-red-600 text-sm bg">{error}</p>}
				</div>
			</DialogTrigger>
			<DialogContent className="pt-16">
				<MDEditor
					value={state}
					onChange={(val) => {
						setState(val || "");
					}}
					className="w-full h-[300px] bg-transparent"
					data-color-mode={"dark"}
					commands={[
						commands.bold,
						commands.italic,
						commands.hr,
						commands.title,
						commands.code,
						commands.link,
						commands.quote,
						commands.checkedListCommand,
						commands.orderedListCommand,
						commands.unorderedListCommand,
						MDColorCommand,
					]}
					visibleDragbar={false}
				/>

				<Button
					variant={"ghost"}
					className="w-[100px] ml-auto"
					onClick={onSave}
				>
					Save
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default MarkdownEditor;
