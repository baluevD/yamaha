var yamahaPort, driver_udp;


IR.AddListener(IR.EVENT_START,0,function()
{

   	IR.SetTimeout(2000, function() 
	{
        yamahaPort = IR.GetVariable("Drivers.yamaha.Port");
/*        driver_udp = IR.CreateDevice(IR.DEVICE_CUSTOM_UDP, "AV Device (UDP)",   
        {
            Host: "192.168.0.22",
            Port: 42260,
            LocalPort: udpLocalPort,  // port on iRidium side for data receiving
            Group: null,  // null - broadcast, "host" - multicast group
            Multicast: false,  // false - broadcast, true - multicast (if multicast group added)
            ScriptMode: IR.DIRECT_AND_SCRIPT
        });*/
        driver.SendEx({ 
            Type: "GET",                                                                    
            Url:  "/YamahaExtendedControl/v1/system/getFeatures",
            Headers: {"X-AppName":"MusicCast/1.40(iOS)","X-AppPort": ""+yamahaPort}
        });

/*        IR.SetInterval (600000, function() 
        {
   
            driver.SendEx({ 
                Type: "GET",                                                                    
                Url:  "/YamahaExtendedControl/v1/system/getFeatures",
                Headers: {"X-AppName":"MusicCast/1.40(iOS)","X-AppPort": ""+udpLocalPort}
            });
        });*/

    });
});

IR.AddListener(IR.EVENT_RECEIVE_TEXT, driver_udp, function(text) 
{  
    IR.Log(text);
});