import {Visitor} from "@swc/core/Visitor";
import {Declaration, TsInterfaceDeclaration, TsTypeAliasDeclaration} from "@swc/types";
import {TsType} from "@swc/core";

export class TypesCollector extends Visitor {

    private typesMap:{[key:string]:string}= {};

    getTypesMap(){
        return this.typesMap;
    }

    override visitTsType(node: TsType | any): TsType | any {
        return node;
    }

   override visitTsTypeAliasDeclaration(n: TsTypeAliasDeclaration): Declaration | any{
       if (n?.id) {
               this.typesMap[n.id.value] = "type";
       }
       return n
   }

    override  visitTsEnumDeclaration(n: any): Declaration | any{
        if (n?.id) {
            this.typesMap[n.id.value] = "enum"  ;
        }
        return n
    }

    override  visitTsInterfaceDeclaration(n: TsInterfaceDeclaration): TsInterfaceDeclaration | any{
        if (n?.id) {
            this.typesMap[n.id.value] = "interface"  ;
        }

        return n
    }
}