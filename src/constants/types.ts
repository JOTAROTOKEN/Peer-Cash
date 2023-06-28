export interface CommonPageProps {
    toRefresh: boolean;
    setToRefresh: (value:boolean)=>void;
}

export interface ActionPageProps extends CommonPageProps{
    setActiveValue: (value:string)=>void;
}

export interface StatisticPageProps extends CommonPageProps{
    activeValue: string;
}