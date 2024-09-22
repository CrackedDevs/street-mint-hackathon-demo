import { QuantityType } from "../supabaseClient";

export class EditionService {
    static getEditionTypeText(type: QuantityType) {
        switch (type) {
            case "unlimited":
                return "Open Edition";
            case "limited":
                return "Limited Edition";
            case "single":
                return "1 0f 1";
            default:
                return "Unknown Edition Type";
        }
    }
}