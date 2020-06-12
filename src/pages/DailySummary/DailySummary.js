// @flow

import React  from 'react';
import { withRouter } from 'react-router';

import moment from "moment";

import { HalfWidthCard, VisualSection, ValueItem, ValueItemsSection } from 'components/Card';

import { Container } from './DailySummary.styles';

import { max } from "d3-array";
import { MainLoading } from "components/Loading";
import { getParams, hexToRgb, strFormat } from "common/utils";
import { movingAverage } from "common/stats";

import useApi from "hooks/useApi";

import { BarPlotter, Plotter } from "./plots";

import usePageLayout from "hooks/usePageLayout";
import URLs from "common/urls";
import type {
    DailySummaryCardProps
} from "./DailySummary.types"
import type { UKSummaryField } from "hooks/hooks.types";


const
    DefaultParams = [
        { key: 'areaName', sign: '=', value: 'United Kingdom' },
        { key: 'areaType', sign: '=', value: 'overview' },
    ],
    Structures = {
        deaths: {
            date: "date",
            newDeathsByPublishDate: "newDeathsByPublishDate",
            cumDeathsByPublishDate: "cumDeathsByPublishDate"
        },
        healthcare: {
            date: "date",
            hospitalCases: "hospitalCases",
            covidOccupiedMVBeds: "covidOccupiedMVBeds",
            newAdmissions: "newAdmissions",
            cumAdmissions: "cumAdmissions"
        },
        cases: {
            date: "date",
            newCasesByPublishDate: "newCasesByPublishDate",
            cumCasesByPublishDate: "cumCasesByPublishDate",
            newPeopleTestedByPublishDate: "newPeopleTestedByPublishDate",
            cumPeopleTestedByPublishDate: "cumPeopleTestedByPublishDate",
        },
        testing: {
            date: "date",
            newTestsByPublishDate: "newTestsByPublishDate",
            cumTestsByPublishDate: "cumTestsByPublishDate",
            plannedCapacityByPublishDate: "plannedCapacityByPublishDate"
        }
    };


export const timestamp = (data): string =>
    data.hasOwnProperty("metadata")
        ? moment(data?.metadata?.lastUpdatedAt).format("dddd D MMMM YYYY [at] h:mma")
        : "";


const groupByUniqueKey = (data, uniqueKeyName) => {

    try {
        return data
            .reduce((acc, { [uniqueKeyName]: grouper, ...rest }) =>
                grouper ? { ...acc, [grouper]: rest } : acc, {})
    } catch {
        return {}
    }

};  // groupByUniqueKey


const NationDeathsPlot = ({ ...props }) => {

    const
        latestNationDeaths = useApi({
            conjunctiveFilters: [
                { key: "areaType", sign: "=", value: "nation" }
            ],
            structure: { name: "areaName", death: "newDeathsByPublishDate" },
            extraParams: [{ key: "latestBy", sign: "=", value: "date" }],
            defaultResponse: []
        }),
        nationalDataDeaths = latestNationDeaths.map(item => item?.death ?? null),
        maxDeath = max(nationalDataDeaths);

    return <BarPlotter
        data={[
            {
                name: "Daily deaths",
                y: latestNationDeaths
                    .map(({ name="" }) => name.replace(/Northern Ireland/g, "NI")),
                x: nationalDataDeaths,
                text: nationalDataDeaths
                    .map(item => `${item}`),
                type: "bar",
                orientation: "h",
                width: 0.7,
                mode: 'marker+text',
                marker: {
                    color: '#005EA5'
                },
                texttemplate: '%{text:s}',
                textposition: nationalDataDeaths
                    .map(item => item !== 0 ? 'auto' : 'outside'),
                cliponaxis: true,
                showlegend: false,
                textfont: {
                    color: nationalDataDeaths
                        .map(item => item === maxDeath ? '#fff' :  '#005EA5'),
                    family: `"GDS Transport", Arial, sans-serif`,
                    size: 11
                }
            }
        ]}
        { ...props }
    />

};  // DeathsCard


/**
 * Iterates through the data until it finds a valid value (not null) and
 * returns the value with its corresponding date:
 *
 *      { date: 'DATE', value: VALUE }
 *
 * If no valid value is found, it will return:
 *
 *      { date: null, value: null }
 *
 * @param data { Array<{ [string]: string} > | number | null }
 *        Must always be sorted by date (descending).
 *
 * @param valueKey { { date: string | null  , value: string | number | null } }
 *        Key for the value whose validity is tested for a given date.
 *
 * @returns { { date: string | null, value: string | number | null } }
 */
const getMaxDateValuePair = ( data: Array<{ [string]: string | number | null }>, valueKey: string ): { date: string | null, value: string | number | null } =>  {

    if ( !valueKey ) return { date: null, value: null };

    for ( const { [valueKey]: value, date } of data ) {

        if ( value )
            return { date: moment(date).format("dddd, D MMMM YYYY"), value: value };

    }

    return { date: null, value: null }

};  // getMaxDateValuePair


const getPlotData = (layout: Array<UKSummaryField>, data) => {

    return layout
        .filter(item => item.hasOwnProperty("chart"))
        .map(item => {
            const yData =
                    data.map(variable => variable?.[item.chart.variableName] ?? null),
                    { r, g, b } = hexToRgb(item.chart.colour);

            return {
                x: data.map(item => item?.date ?? null),
                y: item.chart.rollingAverage ? movingAverage(yData, 7) : yData,
                type: 'line',
                mode: 'lines',
                fill: 'tozeroy',
                fillcolor: `rgba(${r},${g},${b},0.1)`,
                line: {
                    color: item.chart.colour
                }
            }
        })

};  // getYAxisData


const ValueBox = ({ data, primaryValue, secondaryValue=null, primaryTooltip="", secondaryTooltip="", ...rest }) => {

    const
        primaryData = getMaxDateValuePair(data, primaryValue),
        secondaryData = getMaxDateValuePair(data, secondaryValue),
        primaryReplacements = { kwargs: primaryData },
        secondaryReplacements = { kwargs: primaryData };

    return <ValueItem
        primaryValue={ primaryData.value }
        primaryTooltip={ strFormat(primaryTooltip, primaryReplacements) }
        primaryModal={ primaryValue }
        primaryModalReplacements={ primaryReplacements }
        secondaryValue={ secondaryData.value }
        secondaryTooltip={ strFormat(secondaryTooltip, secondaryReplacements) }
        secondaryModal={ secondaryValue }
        secondaryModalReplacements={ secondaryReplacements }
        { ...rest }
    />

};  // getValueItemSections


const DailySummaryCard = ({ params, layout, heading }: DailySummaryCardProps) => {

    const structure = { date: "date" };

    for ( const { primaryValue, secondaryValue=null, ...rest } of layout )  {

        structure[primaryValue] = primaryValue;

        if ( secondaryValue )
            structure[secondaryValue] = secondaryValue;

        if ( rest?.chart ?? null )
            structure[rest.chart.variableName] = rest.chart.variableName;

    }

    const data = useApi({
        conjunctiveFilters: params,
        structure: structure
    });

    return <HalfWidthCard heading={ heading }>
        <VisualSection>
            <Plotter data={ getPlotData(layout, data) }/>
        </VisualSection>
        <ValueItemsSection>
            {
                layout.map((item, index) =>
                    <ValueBox { ...item } data={ data } key={ `${heading}-${index}` }/>)
            }
            {/*{*/}
            {/*    heading.toLowerCase().indexOf("death") > -1*/}
            {/*        ? <NationDeathsPlot/>*/}
            {/*        : null*/}
            {/*}*/}
        </ValueItemsSection>
    </HalfWidthCard>

};  // DailySummaryCard


const DailySummary = ({ location: { search: query } }) => {

    const
        pageLayout = usePageLayout(URLs.pageLayouts.UKSummary),
        urlParams = getParams(query),
        params = urlParams.length ? urlParams : DefaultParams;

    if ( !pageLayout ) return <MainLoading/>;

    return <Container className={ "util-flex util-flex-wrap" }>{
        pageLayout.summary.map(item =>
            <DailySummaryCard
                key={ item.heading }
                params={ params }
                heading={ item.heading }
                layout={ item.fields }/>
        )
    }</Container>

};  // DailySummary

export default withRouter(DailySummary)
