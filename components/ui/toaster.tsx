import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

const TOAST_DURATION = 5000;

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider duration={TOAST_DURATION}>
			{toasts.map(function ({ id, title, description, action, ...props }) {
				return (
					<Toast key={id} {...props}>
						<div className="grid gap-1">
							{title && (
								<ToastTitle
									className={
										props.variant === "destructive" ? "text-red-600" : undefined
									}
								>
									{title}
								</ToastTitle>
							)}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
