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
			<ParametersBlock/>

			<InputSignalBlock/>
			<SpectrumBlock/>
			<AnalysisMethodsBlock/>

			<CharacteristicsBlock/>
			<StatisticsBlock/>
			<ExportBlock/>

			<Modal/>
		</>
	);
}


export default Main;