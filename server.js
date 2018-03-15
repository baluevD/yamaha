var driver = IR.GetDevice("yamaha");
var serverList = IR.GetPopup('server').GetItem('List 1');
var page = IR.GetPopup("main");
var curPopup;
var playInfo;
var settingsInfo;
var serverFiles;
var net_radioFiles;
var usbFiles;
var recentFiles;
var index;
var status;
var presetCounter = 0;
var arr = [];

function createList(l)
{
    l.Template = 'listTemplate';
    // curPopup = popup;
}

function add(text,image,l)
{
    // count items in list
    var current = l.ItemsCount; 
    var curplus = current++;
    // create one more item and add the text   
    l.CreateItem(curplus, 3, {Text: text});
    l.CreateItem(curplus, 2, {Image: image});
}

function fillDirectory(obj,popup)
{
    if(obj.menu_name)
    {
        IR.GetPopup('server').GetItem('Item 2').Text = obj.menu_name;
        IR.GetPopup('server').GetItem('Item 2').Visible = true;
    }
    if(obj.response_code == 0)
    {
        if(obj.max_line)
        {
            if(obj.max_line >= 8)
            {
                if(index<obj.max_line)
                {
                    IR.GetPopup('server').GetItem('Item 1').Enable = false;
                    for(var i = 0;i<obj.list_info.length;i++)
                    {
                        if(obj.list_info[i].attribute == '2'||obj.list_info[i].attribute == '125829122')
                        {
                            add(obj.list_info[i].text,'resource_1.png',serverList);
                            arr.push('d');
                        }
                        else
                        {
                            add(obj.list_info[i].text,obj.list_info[i].thumbnail,serverList);
                            arr.push('f');                       
                        }
                    }
                    if(obj.list_info.length<8)
                    {
                    }
                    else
                    {
                        index = index + 8;
                        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input='+curPopup+'&index='+index+'&size=8']);
                    }   
                }   
            }
            else
            {
                for(var i = 0;i<obj.list_info.length;i++)
                {
                    if(obj.list_info[i].attribute == '2'||obj.list_info[i].attribute == '125829122')
                    {
                        add(obj.list_info[i].text,'resource_1.png',serverList);
                        arr.push('d');
                    }
                    else
                    {
                        add(obj.list_info[i].text,obj.list_info[i].thumbnail,serverList);
                        arr.push('f');                        
                    }
                }

            }
            if(index+8>obj.max_line)
                IR.GetPopup('server').GetItem('Item 1').Enable = true;
        }
    }
}

IR.AddListener(IR.EVENT_START,0,function()
{
    driver.Send(['GET,/YamahaExtendedControl/v1/main/getStatus']);
});

IR.AddListener(IR.EVENT_RECEIVE_TEXT, driver, function(text) 
{
    //IR.Log(text);
    switch(curPopup)
    {
        case 'server':
            serverFiles = JSON.Parse(text);
            fillDirectory(serverFiles,curPopup);
            break;
        case 'net_radio':
            IR.Log('net_radio '+text);
            net_radioFiles = JSON.Parse(text);
            fillDirectory(net_radioFiles,curPopup);
            break;
        case 'usb':
            IR.Log('usb '+text);
            usbFiles = JSON.Parse(text);
            fillDirectory(usbFiles,curPopup);
            break;
        case 'recent':
            IR.Log(text);
            recentFiles = JSON.Parse(text);
            IR.GetPopup('server').GetItem('Item 2').Text = 'History';
            IR.GetPopup('server').GetItem('Item 2').Visible = true;
            if(recentFiles.response_code == 0)
            {
                IR.GetPopup('server').GetItem('Item 1').Enable = false;
                // if(recentFiles.recent_info[i].text)
                // {
                    for(var i = 0;i<recentFiles.recent_info.length;i++)
                    {
                        IR.Log('f'+recentFiles.recent_info[i].text);
                        add(recentFiles.recent_info[i].text,recentFiles.recent_info[i].albumart_url,serverList);
                        arr.push('f');                       
                    }
                // }

            }
            IR.GetPopup('server').GetItem('Item 1').Enable = true;
            break;
        case 'playback':
            playInfo = JSON.Parse(text);
            if(playInfo.response_code == 0)
            {
                if(playInfo.playback)
                    IR.GetPopup('playback').GetItem('playback').Text = playInfo.playback;
                if(playInfo.input)
                    IR.GetPopup('playback').GetItem('input').Text = playInfo.input;
                if(playInfo.repeat)
                    IR.GetPopup('playback').GetItem('repeat').Text = playInfo.repeat;
                if(playInfo.shuffle)
                    IR.GetPopup('playback').GetItem('shuffle').Text = playInfo.shuffle;
                if(playInfo.play_time)
                    IR.GetPopup('playback').GetItem('play_time').Text = playInfo.play_time;
                if(playInfo.total_time)
                    IR.GetPopup('playback').GetItem('total_time').Text = playInfo.total_time;
                if(playInfo.artist)
                    IR.GetPopup('playback').GetItem('artist').Text = playInfo.artist;
                if(playInfo.album)
                    IR.GetPopup('playback').GetItem('album').Text = playInfo.album;
                if(playInfo.track)
                    IR.GetPopup('playback').GetItem('track').Text = playInfo.track;
                IR.SetTimeout(500, function() 
                {  
                    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getPlayInfo']);
                    if(playInfo.albumart_url)
                    {
                        IR.GetPopup('playback').GetItem('albumart').GetState(0).Image = 'http://192.168.1.41'+playInfo.albumart_url;
                    }
                    else
                    {
                        IR.GetPopup('playback').GetItem('albumart').GetState(0).Image = '';
                    }
                });
                if(playInfo.usb_devicetype)
                    IR.GetPopup('playback').GetItem('device').Text = playInfo.usb_devicetype;
            }
            else
                // IR.HidePopup('playback');
                IR.ShowPopup('server');
            break;
        case 'settings':
            IR.Log(text);
            settingsInfo = JSON.Parse(text);
            if(settingsInfo.response_code == 0)
            {
                if(settingsInfo.mute == 'false')
                    IR.GetPopup('settings').GetItem("mute").Value = 1;
                if(settingsInfo.mute == 'true')
                    IR.GetPopup('settings').GetItem("mute").Value = 0;
                if(settingsInfo.direct == 'false')
                    IR.GetPopup('settings').GetItem("direct").Value = 1;
                if(settingsInfo.direct == 'true')
                    IR.GetPopup('settings').GetItem("direct").Value = 0;
                if(settingsInfo.enhancer == 'false')
                    IR.GetPopup('settings').GetItem("enahncer").Value = 1;
                if(settingsInfo.enhancer == 'true')
                    IR.GetPopup('settings').GetItem("enhancer").Value = 0;
                 if(settingsInfo.balance)
                    IR.GetPopup('settings').GetItem('balance').Value = settingsInfo.balance;
                if(settingsInfo.subwoofer_volume)
                    IR.GetPopup('settings').GetItem('subwoofer_volume').Value = settingsInfo.subwoofer_volume;

                if(settingsInfo.bass_extension == 'false')
                    IR.GetPopup('settings').GetItem("bass_extension").Value = 1;
                if(settingsInfo.bass_extension == 'true')
                    IR.GetPopup('settings').GetItem("bass_extension").Value = 0;
                IR.GetPopup('settings').GetItem('volume').Value = status.volume;
            }
            if(playInfo.usb_devicetype)
                IR.GetPopup('playback').GetItem('device').Text = playInfo.usb_devicetype;
            break;
        break;
    }
});

function selectItem(popup,it)
{
    if(arr[it]=='d')
    {
        serverList.Clear();
        createList(serverList);
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setListControl?type=select&index='+it+'']);
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input='+popup+'&index=0&size=8']);
    }
    if(arr[it]=='f')
    {
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setListControl?list_id=main&type=play&index='+it+'']);
        curPopup = 'playback';
        IR.ShowPopup("playback");
        // IR.HidePopup("server");  
    }
    index = 0;
    arr.length = 0; 
}

function returnUp(popup,obj)
{
    if(obj.menu_layer > 0)
    {
        index = 0;
        arr.length = 0;
        serverList.Clear();
        createList(serverList);
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setListControl?type=return']);
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input='+popup+'&index=0&size=8']);
    }
    else
    {
        // IR.HidePopup("server");
        IR.ShowPopup("main");
        IR.GetPopup('server').GetItem('Item 2').Text = '';
        serverList.Clear();
        arr.length = 0;
        index = 0;
        obj = 0;
    }

}


IR.AddListener(IR.EVENT_ITEM_SELECT,IR.GetPopup('server').GetItem('List 1'), function(item, subitem) 
{
    switch(curPopup)
    {
        case 'server':
            selectItem(curPopup,item);
            break;
        case 'net_radio':
            selectItem(curPopup,item);
            break;
        case 'usb':
            selectItem(curPopup,item);
            break;
        case 'recent':
            driver.Send(['GET,/YamahaExtendedControl/v1/netusb/recallRecentItem?zone=main&num='+item+'']);
            curPopup = 'playback';
            IR.ShowPopup("playback");
            // IR.HidePopup("server");  
            index = 0;
            arr.length = 0; 
            break;
    }        
});

// back to previous or out from server
IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("server").GetItem("Item 1"), function ()
{
    switch(curPopup)
    {
        case 'server':
            returnUp(curPopup,serverFiles);
            break;
        case 'net_radio':
            returnUp(curPopup,net_radioFiles);
            break;
        case 'usb':
            returnUp(curPopup,usbFiles);
            break;
        case 'recent':
            // IR.HidePopup("server");
            IR.ShowPopup("main");
            IR.GetPopup('server').GetItem('Item 2').Text = '';
            serverList.Clear();
            arr.length = 0;
            index = 0;
            recentFiles = 0;
            break;
    }
});

IR.AddListener(IR.EVENT_ITEM_PRESS, page.GetItem("server"), function ()
{
    curPopup = 'server';
    page.GetItem("aux").Value = 0;
    page.GetItem("optical").Value = 0;
    serverList.Clear();
    createList(serverList);
    index = 0;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=server']);
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index=0&size=8']);
    IR.ShowPopup('server');  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, page.GetItem("net_radio"), function ()
{
    curPopup = 'net_radio';
    page.GetItem("aux").Value = 0;
    page.GetItem("optical").Value = 0;
    serverList.Clear();
    createList(serverList);
    index = 0;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=net_radio']);
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=net_radio&index=0&size=8']);
    IR.ShowPopup('server');  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, page.GetItem("usb"), function ()
{
    curPopup = 'usb';
    page.GetItem("aux").Value = 0;
    page.GetItem("optical").Value = 0;
    serverList.Clear();
    createList(serverList);
    index = 0;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=usb']);
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=usb&index=0&size=8']);
    IR.ShowPopup('server');  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, page.GetItem("recent"), function ()
{
    curPopup = 'recent';
    page.GetItem("aux").Value = 0;
    page.GetItem("optical").Value = 0;
    serverList.Clear();
    createList(serverList);
    index = 0;
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getRecentInfo']);
    IR.ShowPopup('server');  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, page.GetItem("power"), function ()
{
    if(page.GetItem("power").Value == 1)
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setPower?power=on']);
    else
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setPower?power=standby']);
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 1"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=play']);   
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 2"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=pause']);
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 3"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=stop']); 
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 4"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=previous']);
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getPlayInfo']);   
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 5"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=next']);
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getPlayInfo']);   
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 6"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=fast_reverse_start']);  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 7"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=fast_reverse_end']);     
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 8"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=fast_forward_start']);   
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 9"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setPlayback?playback=fast_forward_end']); 
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 10"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/toggleShuffle']);  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("Item 11"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/toggleRepeat']);  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("settings").GetItem("volume"), function ()
{
    var val = IR.GetPopup("settings").GetItem("volume").Value;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setVolume?volume='+val+'']);  
});

IR.AddListener(IR.EVENT_ITEM_RELEASE, IR.GetPopup("settings").GetItem("volume"), function ()
{
    var val = IR.GetPopup("settings").GetItem("volume").Value;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setVolume?volume='+val+'']);  
});

IR.AddListener(IR.EVENT_ITEM_SHOW, IR.GetPopup("playback"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getPlayInfo']);   
});

IR.AddListener(IR.EVENT_ITEM_SHOW, IR.GetPopup("settings"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/main/getStatus']);
   curPopup = 'settings';   
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("store_preset"), function ()
{
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/storePreset?num='+presetCounter+'']);
    presetCounter++;  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("add_bookmark"), function ()
{
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/manageList?list_id=main&type=add_bookmark&timeout=500']);
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup('settings').GetItem("mute"), function ()
{
    if(IR.GetPopup('settings').GetItem("mute").Value == 1)
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setMute?enable=true']);
    else
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setMute?enable=false']);
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup('settings').GetItem("direct"), function ()
{
    if(IR.GetPopup('settings').GetItem("direct").Value == 1)
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setDirect?enable=true']);
    else
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setDirect?enable=false']);
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup('settings').GetItem("enhancer"), function ()
{
    if(IR.GetPopup('settings').GetItem("enhancer").Value == 1)
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setEnhancer?enable=true']);
    else
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setEnhancer?enable=false']);
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup('settings').GetItem("bass_extension"), function ()
{
    if(IR.GetPopup('settings').GetItem("bass_extension").Value == 1)
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setBassExtension?enable=true']);
    else
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setBassExtension?enable=false']);
});

IR.AddListener(IR.EVENT_ITEM_PRESS, page.GetItem("aux"), function ()
{
    if(page.GetItem("aux").Value == 1)
    {
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=aux']);
        page.GetItem("optical").Value = 0;
    }
    else
    {
        page.GetItem("aux").Value = 1;
    }

});

IR.AddListener(IR.EVENT_ITEM_PRESS, page.GetItem("optical"), function ()
{
    if(page.GetItem("optical").Value == 1)
    {
        
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=optical']);
        page.GetItem("aux").Value = 0;
    }

    else
    {
        page.GetItem("optical").Value = 1;
        // page.GetItem("aux").Value == 0;
    }

});


IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("settings").GetItem("balance"), function ()
{
    var balance = IR.GetPopup("settings").GetItem("balance").Value;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setBalance?value='+balance+'']);  
});

IR.AddListener(IR.EVENT_ITEM_RELEASE, IR.GetPopup("settings").GetItem("balance"), function ()
{
    var balance = IR.GetPopup("settings").GetItem("balance").Value;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setBalance?value='+balance+'']);   
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("settings").GetItem("subwoofer_volume"), function ()
{
    var sub = IR.GetPopup("settings").GetItem("subwoofer_volume").Value;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setSubwooferVolume?volume='+sub+'']);  
});

IR.AddListener(IR.EVENT_ITEM_RELEASE, IR.GetPopup("settings").GetItem("subwoofer_volume"), function ()
{
    var sub = IR.GetPopup("settings").GetItem("subwoofer_volume").Value;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setSubwooferVolume?volume='+sub+'']);   
});

function checkPlayback()
{
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getPlayInfo']);
    curPopup = 'playback';
    page.GetItem("aux").Value = 0;
    page.GetItem("optical").Value = 0;
}
