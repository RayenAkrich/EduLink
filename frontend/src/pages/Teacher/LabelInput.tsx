interface Props{
    label:string;
}
function LabelInput({label}:Props){
    return(
        <>
            <div className="flex flex-col p-4">
                <p>{label}<span className="text-red-500">*</span></p>
                <input type="text" className="border rounded" />
            </div>
        </>
    )
}
export default LabelInput;