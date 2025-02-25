import { ActiveStatusType } from "@/ts/api.types";
import { useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

type Props = {
	status: ActiveStatusType;
	onEnable: () => Promise<void>;
	onDisable: () => Promise<void>;
};

const StatusSwitch = ({ onEnable, onDisable, status }: Props) => {
	const [disabled, setDisabled] = useState(false);
	return (
		<div className="flex items-center space-x-2">
			<Label htmlFor="entity-status" className="text-red-500">
				Disabled
			</Label>
			<Switch
				disabled={disabled}
				id="entity-status"
				checked={status === "enabled"}
				onCheckedChange={async (checked) => {
					setDisabled(true);
					try {
						if (checked) {
							await onEnable();
						} else {
							await onDisable();
						}
					} catch (e) {
						console.log(e);
					} finally {
						setDisabled(false);
					}
				}}
			/>
			<Label htmlFor="entity-status" className="text-green-500">
				Enabled
			</Label>
		</div>
	);
};

export default StatusSwitch;
