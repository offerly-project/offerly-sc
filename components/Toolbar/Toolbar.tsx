import React from "react";

type Props = { children: React.ReactNode };

const Toolbar = ({ children }: Props) => {
	return <div className="flex-row flex space-x-4">{children}</div>;
};

export default Toolbar;
