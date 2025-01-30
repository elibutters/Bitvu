import DashCharts from '@/components/Dashboard/DashCharts';
import DashNav from '@/components/Dashboard/DashNav';

export default function DashBoard() {
    return (
        <div className="flex flex-col h-[100vh]">
            <DashNav/>
            <div className="overflow-y-auto">
                <DashCharts/>
            </div>
        </div>
    );
};

/*
            <div className="overflow-y-auto">
                <DashCharts/>
            </div>
*/