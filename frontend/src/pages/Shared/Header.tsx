interface Props{
    setHide:React.Dispatch<React.SetStateAction<boolean>>
    hide:boolean
}
function Header({setHide,hide}:Props){
    return(
        <div className="flex flex-nowrap items-center justify-between px-7 py-2 shadow-lg text-slate-900 sticky bg-white top-0 ">
            <img src="src/assets/ChatGPT Image 23 nov. 2025, 14_44_13.png" alt="logo ecole" className="w-20 h-20"/>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer -ml-30 mr-35 " onClick={()=> setHide(!hide)} >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input type="text" placeholder="Recherche" name="" id=""className="border rounded w-80 h-10 p-2" />
            </div>

            <div className="flex gap-3 " >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <img src="" alt="image(enseignant/parent)" />
                <div className="flex flex-col ">
                    <p>{localStorage.getItem("nom")}</p>
                    <p>{localStorage.getItem("role")}</p>
                </div>
            </div>
            
        </div>
    )
}
export default Header;