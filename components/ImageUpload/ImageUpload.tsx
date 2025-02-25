import { axiosInstance } from "@/configs/configs";
import { createFileObject, formatAssetPath, randomId } from "@/utils/utils";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import { BarLoader } from "react-spinners";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import styles from "./ImageUpload.module.css";

type Props = {
	pathPrefix: string;
	path?: string;
	onChange: (path: string) => void;
	onUploadStateChange?: (uploading: boolean) => void;
	dims?: {
		height: number;
		width: number;
	};
	fit?: boolean;
};

const ImageUpload = ({
	pathPrefix,
	path,
	onChange,
	onUploadStateChange,
	dims,
	fit = false,
}: Props) => {
	const [loading, setLoading] = useState(true);
	const inputRef = useRef<HTMLInputElement>(null);

	const [imageUrl, setImageUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!path) {
			setImageUrl(null);
			setLoading(false);
			return;
		}
		const fullPath = formatAssetPath(path);
		createFileObject(fullPath)
			.then((file) => {
				if (file) {
					const url = URL.createObjectURL(file);
					setImageUrl(url);
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}, [path]);

	const [uploading, setUploading] = useState(false);
	useEffect(() => {
		if (onUploadStateChange) {
			onUploadStateChange(uploading);
		}
	}, [uploading]);

	const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const formData = new FormData();
		const image = e.target.files![0];
		const storePath = path ? path : `${pathPrefix}/${randomId()}.png`;
		if (dims) {
			formData.append("dims", `${dims.width}x${dims.height}`);
		}
		if (fit) {
			formData.append("fit", "true");
		}
		formData.append("image", image);
		formData.append("path", storePath);
		setUploading(true);
		axiosInstance.post("/uploads/images", formData).then(() => {
			setUploading(false);
			onChange(storePath);
		});
		setImageUrl(URL.createObjectURL(image));
	};

	const [width, height] = useMemo(() => {
		if (dims) {
			return [dims.width * 0.75, dims.height * 0.75];
		}
		return [250, 250];
	}, [dims]);

	if (loading) {
		return (
			<Card
				style={{ height, width }}
				className="m-auto p-1 grid place-items-center relative"
			></Card>
		);
	}

	return (
		<Card
			style={{ height, width }}
			className="m-auto p-1 grid place-items-center relative"
			onClick={() => inputRef.current?.click()}
		>
			{imageUrl ? (
				<>
					<img
						src={imageUrl}
						style={{
							height: height - 50,
							width: width - 50,
							opacity: uploading ? 0.5 : 1,
						}}
						className="rounded-lg"
					/>
					{uploading && (
						<div className={styles.progress_bar_container}>
							<BarLoader color="white" />
						</div>
					)}
				</>
			) : (
				<Button variant={"ghost"} className="h-full w-full">
					<div className="flex flex-row gap-2 items-center justify-center opacity-50">
						<FontAwesomeIcon icon={faUpload} />
						<span>Upload</span>
					</div>
				</Button>
			)}
			<input
				ref={inputRef}
				onChange={onUpload}
				type="file"
				className="hidden"
			/>
		</Card>
	);
};

export default ImageUpload;
