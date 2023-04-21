using {sap.bootcamp as my} from '../db/data-model';

@Capabilities.KeyAsSegmentSupported : true
service CarbonService {
    entity Person           as projection on my.Person;
    entity Road             as projection on my.Road;
    entity Room             as projection on my.Room;
    entity Road2Room        as projection on my.Road2Room;
    entity Person2Room      as projection on my.Person2Room;
    entity PersonCredential as projection on my.PersonCredential;
    entity Person2Road as projection on my.Person2Road;

    //TO DOOOO!!
    //action suggestTravelOptions(from: Integer, to: Integer, vehicleTypes: Array of String(20)) returns Array of TravelOptions;

    @readonly
    entity IATACode         as projection on my.IATACode;

    action   loadRoad(email : String, request : many request)         returns {
        responseCode : String;
        responseMessage : String;
    };

    action   createRoom(email : String, roomName : String)            returns {
        responseCode : String;
        responseMessage : String;
    };

    action   assignRoad2Room(roomID : String, roadID : String)        returns {
        responseCode : String;
        responseMessage : String;
    };


    function getMyRooms(email : String)                               returns many {
        roomID : String;
        roomName : String;
        owner : String;

    };

    function GetDepartmentParticipantsTop15(roomID : String)                               returns many {
        name : String;
        email : String;
        totalCo2 : Double;
        totalTrips : Integer;
    };

    function getNearestAirport(apiKey : String,latitude : String, longitude : String) returns {
        response : many airports
    };

    action   AddRoomParticipant(roomID : String, email : String)      returns many {
        responseCode : String;
        responseMessage : String;
    };

    function loginCheck(email : String, password : String)            returns {
        responseCode : String;
        responseMessage : String;
    };

    type airports {
        name         : String;
        iata_code    : String;
        icao_code    : String;
        lat          : String;
        lng          : String;
        country_code : String;
        popularity   : String;
        distance     : String;
    }


    type request {
        startPoint    : String;
        endPoint      : String;
        transportType : String;
        class         : String;
        distance      : String;
        UoM           : String;
    }



}
