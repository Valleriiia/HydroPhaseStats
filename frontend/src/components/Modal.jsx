import { useModalStore } from '@src/store';


function Modal()
{
	const { current, close } = useModalStore();

	if (!current) return null;

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget)
		{
			close();
		}
	};

	return (
		<div className="modal-backdrop" onClick={handleBackdropClick}>
			<div className="modal">
				<div className="modal__title">{current.name}</div>
				<div className="modal__text">{current.props.text}</div>
				<button className="modal__button" onClick={close}>
					OK
				</button>
			</div>
		</div>
	);
}


export default Modal;