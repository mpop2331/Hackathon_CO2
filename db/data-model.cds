namespace sap.bootcamp;
using{managed,cuid,sap} from '@sap/cds/common';

entity PersonCredential{
    key credID: UUID;
    person:Association to Person;
    password:String;
}

entity Person{
    Key email:String;
    firstName:String;
    lastName:String;
    cred:Composition of PersonCredential
                              on cred.person = $self;
    road:Composition of many Road
                              on road.parent = $self;
    room:Composition of many Person2Room
                              on room.personID = $self;
    
}

entity Person2Room{
    personID: Association to Person;
    roomID: Association to Room;
}

entity Road{
    key roadID: UUID;
    startingPoint: String;
    endPoint:String;
    co2e: Decimal;
    co2e_unit: String;
    date:Timestamp;
    transportType: String;
    distance:String;
    UoM:String;
    parent: Association to Person;
    room : Composition of many Road2Room
                              on room.roadID = $self;
    person:Composition of many Person2Road
                              on person.roadID = $self;
    
}

entity Person2Road{
    personID: Association to Person;
    roadID: Association to Road;
}

entity Room{
    key roomID: UUID;
    roomName: String;
    owner:String;
    road: Composition of many Road2Room
                              on road.roomID = $self;
    person:Composition of many Person2Room
                              on person.roomID = $self;
    
}

entity Road2Room{
    roomID: Association to Room;
    roadID: Association to Road;
}

entity IATACode{
    country : String;
    city : String;
    airportName: String;
    iataCode: String;
}



