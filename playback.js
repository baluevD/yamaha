var temp_;
var counter = 0;

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

IR.AddListener(IR.EVENT_ITEM_SHOW, IR.GetPopup("playback"), function ()
{
   driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getPlayInfo']);   
});

IR.AddListener(IR.EVENT_RECEIVE_TEXT, driver, function(text) 
{
   if(curPopup=='playback')
   {
       IR.Log(text);
       temp_ = JSON.Parse(text);
        if(temp_.response_code == 0)
       {
        if(temp_.playback)
            IR.GetPopup('playback').GetItem('playback').Text = temp_.playback;
        if(temp_.input)
            IR.GetPopup('playback').GetItem('input').Text = temp_.input;
        if(temp_.repeat)
            IR.GetPopup('playback').GetItem('repeat').Text = temp_.repeat;
        if(temp_.shuffle)
            IR.GetPopup('playback').GetItem('shuffle').Text = temp_.shuffle;
        if(temp_.play_time)
            IR.GetPopup('playback').GetItem('play_time').Text = temp_.play_time;
        if(temp_.total_time)
            IR.GetPopup('playback').GetItem('total_time').Text = temp_.total_time;
        if(temp_.artist)
            IR.GetPopup('playback').GetItem('artist').Text = temp_.artist;
        if(temp_.album)
            IR.GetPopup('playback').GetItem('album').Text = temp_.album;
        if(temp_.track)
            IR.GetPopup('playback').GetItem('track').Text = temp_.track;
        if(counter!=1)
        {
            IR.SetTimeout(500, function() 
            {  
                IR.Log('in'); 
                driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getPlayInfo']);
                if(temp_.albumart_url)
                {
                    IR.Log("eee");
                    IR.Log(temp_.albumart_url);
                    IR.GetPopup('playback').GetItem('albumart').GetState(0).Image = 'http://192.168.1.41'+temp_.albumart_url;
                }
                else
                {
                    IR.GetPopup('playback').GetItem('albumart').GetState(0).Image = '';
                }
                IR.Log('out'); 
            });
        }
      if(temp_.usb_devicetype)
      IR.GetPopup('playback').GetItem('device').Text = temp_.usb_devicetype;         
   }
   }
});