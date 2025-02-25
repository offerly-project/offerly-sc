import { faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICommand } from "@uiw/react-md-editor";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
	executeCommand: (command: ICommand<string>, name?: string) => void;
};

const MDColorCommandElement = ({ executeCommand }: Props) => {
	const [color, setColor] = useState<string>();
	const [open, setOpen] = useState(false);

	const onCancel = () => {
		setOpen(false);
	};

	const onApply = () => {
		if (color) executeCommand(createColorCommand(color));
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger>
				<FontAwesomeIcon icon={faPaintbrush} className={"scale-[0.7]"} />
			</PopoverTrigger>
			<PopoverContent className="flex flex-col space-y-2 w-[250px] items-center">
				<SketchPicker
					color={color}
					className="h-[300px] w-[200px] scale-[0.9]"
					onChange={(color) => {
						setColor(color.hex);
					}}
				/>
				<div className="flex flex-row space-x-4">
					<Button variant={"default"} onClick={onApply}>
						Apply
					</Button>
					<Button variant={"ghost"} onClick={onCancel}>
						Cancel
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

const createColorCommand = (color: string): ICommand => ({
	name: "color-picker",
	execute: (state, api) => {
		const selectedText = state.selectedText;
		const colorRegex = /<span style="color:\s*#[0-9a-fA-F]{3,6}">(.+?)<\/span>/;

		if (colorRegex.test(selectedText)) {
			const newText = selectedText.replace(
				colorRegex,
				`<span style="color: ${color}">$1</span>`
			);
			api.replaceSelection(newText);
		} else {
			api.replaceSelection(
				`<span style="color: ${color}">${selectedText}</span>`
			);
		}
	},
});

export const MDColorCommand: ICommand = {
	keyCommand: "color-picker",
	render: (command, disabled, executeCommand) => (
		<MDColorCommandElement executeCommand={executeCommand} />
	),
};
