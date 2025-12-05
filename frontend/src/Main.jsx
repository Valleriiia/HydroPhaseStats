import ParametersBlock from "@src/components/ParametersBlock";
import InputSignalBlock from "@src/components/InputSignalBlock";
import SpectrumBlock from "@src/components/SpectrumBlock";
import AnalysisMethodsBlock from "@src/components/AnalysisMethodsBlock";
import CharacteristicsBlock from "@src/components/CharacteristicsBlock";
import ExportBlock from "@src/components/ExportBlock";
import StatisticsBlock from "@src/components/StatisticsBlock";
import Modal from "@src/components/Modal";

function Main()
{
    return(
        <>
            <div className="col-left">
                <ParametersBlock/>
            </div>

            <div className="col-center">
                <InputSignalBlock/>
                <SpectrumBlock/>
                <AnalysisMethodsBlock/>
            </div>

            <div className="col-right">
                <CharacteristicsBlock/>
                <StatisticsBlock/>
                <ExportBlock/>
            </div>

            <Modal/>
        </>
    );
}

export default Main;