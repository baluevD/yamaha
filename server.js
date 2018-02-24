var driver = IR.GetDevice("yamaha");
var serverList = IR.GetPopup('server').GetItem('List 1');
var curPopup;
var serverFiles;
var index;
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

IR.AddListener(IR.EVENT_RECEIVE_TEXT, driver, function(text) 
{
	switch(curPopup)
	{
		case 'server':
			serverFiles = JSON.Parse(text);
			fillDirectory(serverFiles,curPopup);
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