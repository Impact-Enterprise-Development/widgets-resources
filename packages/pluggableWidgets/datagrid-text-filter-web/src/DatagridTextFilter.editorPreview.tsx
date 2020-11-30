import { createElement, ReactElement } from "react";
import { DatagridTextFilterPreviewProps } from "../typings/DatagridTextFilterProps";
import { FilterComponent } from "./components/FilterComponent";

export function preview(props: DatagridTextFilterPreviewProps): ReactElement {
    return (
        <FilterComponent
            adjustable={props.adjustable}
            defaultFilter={props.defaultFilter}
            delay={props.delay ?? 500}
            filterDispatcher={() => ({})}
            placeholder={props.placeholder}
            defaultValue={props.defaultValue}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/DatagridTextFilter.scss");
}
