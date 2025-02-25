type Props = { children: React.ReactNode };

const Form = ({ children }: Props) => {
	return <div className="flex flex-col gap-4 pt-4 w-full">{children}</div>;
};

export default Form;
