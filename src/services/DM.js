import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

export async function GetDMYMMPrint_cj(params, sf, ef) {
    let rt = await Post(`${baseUrl}/DMModify/DMPrint_cj`, { ...params, PrintType: '地名预命名' }, sf, ef);
    return rt;
}

export async function GetDMHZPrint_cj(params, sf, ef) {
    let rt = await Post(`${baseUrl}/DMModify/DMPrint_cj`, { ...params, PrintType: '地名核准书' }, sf, ef);
    return rt;
}


export async function SubmitDMYMMPrint(params, sf, ef) {
    let rt = await Post(`${baseUrl}/DMModify/SubmitDMPrint`, params, sf, ef);
    return rt;
}

export async function SubmitDMHZPrint(params, sf, ef) {
    let rt = await Post(`${baseUrl}/DMModify/SubmitDMPrint`, params, sf, ef);
    return rt;
}