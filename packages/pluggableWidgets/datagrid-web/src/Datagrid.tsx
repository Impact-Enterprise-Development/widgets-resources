import { createElement, ReactElement, useCallback, useState } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";

import "./ui/Datagrid.scss";
import { Table } from "./components/Table";
import { MySuperWidget } from "./components/MySuperWidget";
import { FilterContext, FilterFunction } from "./components/provider";

export default function Datagrid(props: DatagridContainerProps): ReactElement {
    const isServerSide = !(props.columnsFilterable || props.columnsSortable);
    const isInfiniteLoad = !props.pagingEnabled && isServerSide;
    const currentPage = isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;

    useState(() => {
        if (isServerSide) {
            if (props.datasource.limit === Number.POSITIVE_INFINITY) {
                props.datasource.setLimit(props.pageSize);
            }
        } else {
            props.datasource.setLimit(undefined);
            props.datasource.setOffset(0);
        }
    });

    const setPage = useCallback(
        computePage => {
            const newPage = computePage(currentPage);
            if (isInfiniteLoad) {
                props.datasource.setLimit((newPage + 1) * props.pageSize);
            } else {
                props.datasource.setOffset(newPage * props.pageSize);
            }
        },
        [props.datasource, props.pageSize, isInfiniteLoad, currentPage]
    );

    const customFiltersState = props.columns.map(() => useState<FilterFunction>());
    const items = (props.datasource.items ?? []).filter(item =>
        customFiltersState.every(
            ([customFilter], columnIndex) =>
                !customFilter || customFilter.filter(item, props.columns[columnIndex].attribute)
        )
    );

    return (
        <Table
            className={props.class}
            columns={props.columns}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            data={items}
            filterMethod={props.filterMethod}
            footerWidgets={<div className="footer">{props.footerWidgets}</div>}
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            headerWidgets={<div className="header">{props.headerWidgets}</div>}
            numberOfItems={props.datasource.totalCount}
            page={currentPage}
            pageSize={props.pageSize}
            paging={props.pagingEnabled}
            pagingPosition={props.pagingPosition}
            setPage={setPage}
            styles={props.style}
            cellRenderer={useCallback(
                (renderWrapper, value, columnIndex) => {
                    const column = props.columns[columnIndex];
                    return renderWrapper(
                        column.hasWidgets && column.content ? (
                            column.content(value)
                        ) : (
                            <span className="td-text">{column.attribute(value).displayValue}</span>
                        )
                    );
                },
                [props.columns]
            )}
            valueForFilter={useCallback(
                (value, columnIndex) => {
                    const column = props.columns[columnIndex];
                    return column.attribute(value).displayValue;
                },
                [props.columns]
            )}
            valueForSort={useCallback(
                (value, columnIndex) => {
                    const column = props.columns[columnIndex];
                    return column.attribute(value).value;
                },
                [props.columns]
            )}
            filterRenderer={useCallback(
                (renderWrapper, columnIndex) =>
                    renderWrapper(
                        <FilterContext.Provider value={customFiltersState[columnIndex][1]}>
                            <MySuperWidget />
                        </FilterContext.Provider>
                    ),
                [props.columns, props.datasource]
            )}
        />
    );
}
