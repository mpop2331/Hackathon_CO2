const cds = require("@sap/cds");
const SapCfAxios = require("sap-cf-axios").default;
const CalculateCarbonAPI = SapCfAxios("CalculateCarbonAPI");
const NearestAirportAPI = SapCfAxios("NearestAirportAPI");

module.exports = cds.service.impl(async function () {
    
    const db = await cds.connect.to("db");
    const { IATACode, Road,Room, Road2Room,Person,Person2Room,Person2Road } = this.entities;
    this.on("READ", IATACode, async (req) => {
        const AirportIATACode = await cds.connect.to("AirportIATACode");
        return AirportIATACode.tx(req).run(req.query);
    });

    this.on("loadRoad", async (req) => {
        await CalculateCarbonAPI({
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
            data: JSON.stringify({ "request": req.data.request }),
        }).then(async function (response) {
            for (var node of response.data.row) {
                var roadNode = node;
                //roadNode.date = new Date();
                roadNode.parent_email = req.data.email;;
                roadNode.date = new Date();
                console.log("_______________________");
                console.log(roadNode);
                console.log("_______________________");
                try {
                    await db.post(Road).entries(roadNode);
                } catch (error) {
                    return {
                        responseCode: "500",
                        responseMessage: "Error on Posting data",
                    };
                }
            }
        });
        return {
            responseCode: "200",
            responseMessage: "Data was successfully added",
        }
    })

    this.on("createRoom",async(req)=>{
        var roomNode = {
            roomName: req.data.roomName,
            owner: req.data.email
        }
        try {
            await db.post(Room).entries(roomNode);
        } catch (error) {
            return {
                responseCode: "500",
                responseMessage: "Error on Posting data",
            };
        }

        var person2roomNode = {
            personID_email: req.data.email,
            roomID_roomID: roomNode.roomID
        }
        console.log(person2roomNode);
        
        try {
            await db.post(Person2Room).entries(person2roomNode);
        } catch (error) {
            return {
                responseCode: "500",
                responseMessage: "Error on Posting data",
            };
        }
                
        return {
            responseCode: "200",
            responseMessage: "Data was successfully added",
        }
    });

    this.on("assignRoad2Room",async(req)=>{
        const existRoom = await db.read(Room).where({roomID: req.data.roomID})
        if(existRoom.length < 1 ){
            return {
                responseCode: "500",
                responseMessage: "Room ID does not exist",
            };
        }
        const existRoad = await db.read(Road).where({roadID: req.data.roadID})
        if(existRoad.length < 1 ){
            return {
                responseCode: "500",
                responseMessage: "Road ID does not exist",
            };    
        }
        var road2RoomNode = {
            roomID_roomID:req.data.roomID,
            roadID_roadID:req.data.roadID
        }
        try {
            await db.post(Road2Room).entries(road2RoomNode);
        } catch (error) {
            console.log(error);
            return {
                responseCode: "500",
                responseMessage: "Error on Posting data",
            };
        }

        return {
            responseCode: "200",
            responseMessage: "Data was successfully added",
        }
    });

    this.on ('loginCheck', async (req) => {
        const userName = req.data.email
        const existuserName = await db.read(Person).where({email: userName})
        if(existuserName.length < 1 ){
            return {
                responseCode: "500",
                responseMessage: "Person doesn not exist",
            };    
        }
        return {
            responseCode: "200",
            responseMessage: "Login data OK",
        };    
    })

    this.on ('getMyRooms', async (req) => {
        const userName = req.data.email
        var roomList = [];
        await db.read(Person2Room).where({personID_email: userName}).then(async function (response) {
            for(node of response){
                const roomNode = await db.read(Room).where({roomID: node.roomID_roomID})
                //I am using [0] because I know that is just ONE element that exist
                const respNode = {
                    roomID: roomNode[0].roomID,
                    roomName:roomNode[0].roomName,
                    owner:roomNode[0].owner
                }
                roomList.push(respNode);
                
            }
        })
                 
        return roomList;   
    })
    
    this.on ('getNearestAirport', async (req) => {
        var aAirports = []
        await NearestAirportAPI({
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
            url: "/api/v9/nearby?api_key="+req.data.apiKey+"&lat="+req.data.latitude+"&lng="+req.data.longitude+"&distance=100",
        }).then(async function (response) {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(response);
            for (var node of response.data.response.airports) {
                if("iata_code" in node){ /** will return true if exist */
                    aAirports.push(node)
                }
            }
        });
        return {"response":aAirports} 
    })
    
    this.on("AddRoomParticipant",async(req)=>{
        const existRoom = await db.read(Room).where({roomID: req.data.roomID})
        if(existRoom.length < 1 ){
            return {
                responseCode: "500",
                responseMessage: "Room ID does not exist",
            };
        }
        const existPerson = await db.read(Person).where({email: req.data.email})
        if(existPerson.length < 1 ){
            return {
                responseCode: "500",
                responseMessage: "Person ID does not exist",
            };    
        }
        var person2RoomNode = {
            personID_email:req.data.email,
            roomID_roomID:req.data.roomID
        }
        try {
            await db.post(Person2Room).entries(person2RoomNode);
        } catch (error) {
            console.log(error);
            return {
                responseCode: "500",
                responseMessage: "Error on Posting data",
            };
        }

        return {
            responseCode: "200",
            responseMessage: "Data was successfully added",
        }
    });


    this.on("GetDepartmentParticipantsTop15",async(req)=>{
        const person2RoomNode = await db.read(Person2Room).where({roomID_roomID: req.data.roomID})
        if(person2RoomNode.length < 1 ){
            return {
                responseCode: "500",
                responseMessage: "Room ID does not exist",
            };
        }
        
        var aResult =[]
        for(personNode of person2RoomNode){
            const existPerson = await db.read(Person).where({email: personNode.personID_email})
            if(existPerson.length > 0 ){
                oNode= await getPersonCO2Sum(personNode.personID_email);
                oNode.name = existPerson[0].firstName +" " +existPerson[0].lastName;
                oNode.email = existPerson[0].email;
                aResult.push(oNode);
            }
        }
        aResult = aResult.sort((a, b) => {
            if (a.totalCo2 < b.totalCo2) {
              return -1;
            }
          });
        
        //get first 15 elements
        return aResult.slice(0, 15);
    });

    async function getPersonCO2Sum(email){
        const aPersonRaod = await db.read(Road).where({parent_email: email})
        var dTotalCo2 = 0.0;
        var iTotalTrips = 0;
        for(oNode of aPersonRaod){
            dTotalCo2 = dTotalCo2 + parseFloat(oNode.co2e)
            iTotalTrips = iTotalTrips + 1; 
        }
        return {
            totalCo2:dTotalCo2.toFixed(2),
            totalTrips:iTotalTrips
        }
    }
});


