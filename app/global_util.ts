import {errormsg} from './globals'

export function modifyTextContent(content, data: string) {return content.textContent = data}
export function returnError (err: string) {return modifyTextContent(errormsg, err)}
export function clearContent (content: HTMLElement) {return modifyTextContent(content, "")}
export function print(data: string) {return console.log(data)}
export function toJson (data: Response) {return data.json()}
export function modifyParent(content, data, remove?: boolean) {return (remove && content.removeChild(data)) || content.appendChild(data)}