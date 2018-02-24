var driver = IR.GetDevice("yamaha");
var serverList = IR.GetPopup('server').GetItem('List 1');
var page = IR.GetPage("Страница 1");
var curPopup;
var playInfo;
var serverFiles;
var index;
var status;
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
        IR.GetPopup(popup).GetItem('Item 2').Text = obj.menu_name;
        IR.GetPopup(popup).GetItem('Item 2').Visible = true;
    }
    if(obj.response_code == 0)
    {
        if(obj.max_line)
        {
            if(obj.max_line >= 8)
            {
                if(index<obj.max_line)
                {
                    IR.GetPopup(popup).GetItem('Item 1').Enable = false;
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
                        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index='+index+'&size=8']);
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
                IR.GetPopup(popup).GetItem('Item 1').Enable = true;
        }
    }
}

IR.AddListener(IR.EVENT_START,0,function()
{
    driver.Send(['GET,/YamahaExtendedControl/v1/main/getStatus']);
});

IR.AddListener(IR.EVENT_RECEIVE_TEXT, driver, function(text) 
{
    switch(curPopup)
    {
        case 'server':
            serverFiles = JSON.Parse(text);
            fillDirectory(serverFiles,curPopup);
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
            }
            if(playInfo.usb_devicetype)
                IR.GetPopup('playback').GetItem('device').Text = playInfo.usb_devicetype;
            break;
        default:
            status = JSON.Parse(text);
            if(status.power == 'on')
                page.GetItem("power").Value = 1;
            if(status.power == 'standby')
                page.GetItem("power").Value = 0;
            IR.GetPopup('playback').GetItem('volume').Value = status.volume;
        break;
    }
});


IR.AddListener(IR.EVENT_ITEM_SELECT,IR.GetPopup('server').GetItem('List 1'), function(item, subitem) 
{
    if(arr[item]=='d')
    {
        serverList.Clear();
        createList(serverList);
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setListControl?type=select&index='+item+'']);
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index=0&size=8']);
    }
    if(arr[item]=='f')
    {
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setListControl?list_id=main&type=play&index='+item+'']);
        curPopup = 'playback';
        IR.ShowPopup("playback");
        IR.HidePopup("server");  
    }
    index = 0;
    arr.length = 0;     
});

// back to previous or out from server
IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("server").GetItem("Item 1"), function ()
{
    if(serverFiles.menu_layer > 0)
    {
        index = 0;
        arr.length = 0;
        serverList.Clear();
        createList(serverList);
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setListControl?type=return']);
        driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index=0&size=8']);
    }
    else
    {
        IR.HidePopup("server");
        serverList.Clear();
        arr.length = 0;
        index = 0;
    }
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetItem("Страница 1").GetItem("server"), function ()
{
    curPopup = 'server';
    serverList.Clear();
    createList(serverList);
    index = 0;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=server']);
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index=0&size=8']);
    IR.ShowPopup('server');  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetItem("Страница 1").GetItem("net_radio"), function ()
{
    curPopup = 'server';
    serverList.Clear();
    createList(serverList);
    index = 0;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=net_radio']);
    driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index=0&size=8']);
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

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetPopup("playback").GetItem("volume"), function ()
{
    var val = IR.GetPopup("playback").GetItem("volume").Value;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setVolume?volume='+val+'']);  
});

IR.AddListener(IR.EVENT_ITEM_RELEASE, IR.GetPopup("playback").GetItem("volume"), function ()
{
    var val = IR.GetPopup("playback").GetItem("volume").Value;
    driver.Send(['GET,/YamahaExtendedControl/v1/main/setVolume?volume='+val+'']);  
});

IR.AddListener(IR.EVENT_ITEM_SHOW, IR.GetPopup("playback"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getPlayInfo']);   
});