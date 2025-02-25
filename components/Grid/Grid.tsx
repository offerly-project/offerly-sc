import React from "react";
import { FixedSizeGrid } from "react-window";

type Props = {
	children: React.ReactNode;
	columnCount: number;
	rowCount: number;
	columnWidth: number;
	rowHeight: number;
};

const Grid = ({
	children,
	columnCount,
	rowCount,
	columnWidth,
	rowHeight,
}: Props) => {
	const childrenArray = React.Children.toArray(children);

	const Cell = ({
		columnIndex,
		rowIndex,
		style,
	}: {
		columnIndex: number;
		rowIndex: number;
		style: React.CSSProperties;
	}) => {
		const index = rowIndex * columnCount + columnIndex;
		return <div style={style}>{childrenArray[index]}</div>;
	};

	return (
		<FixedSizeGrid
			columnCount={columnCount}
			rowCount={rowCount}
			columnWidth={columnWidth}
			rowHeight={rowHeight}
			width={window.screen.width * 0.75}
			height={window.screen.height * 0.6}
			style={{ margin: "2em auto" }}
		>
			{Cell}
		</FixedSizeGrid>
	);
};

export default Grid;
