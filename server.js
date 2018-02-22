var driver = IR.GetDevice("yamaha");
var list = IR.GetPopup('server').GetItem('List 1');
var curPopup;
var layer;
var nextLayer;
var temp;
var temptemp;
var index = 0;
var arr = [];
var back = false;
var sSelect = false,nSelect = false;
var flag = 0;
var isback = 0;
// var first = fal

function createList()
{
	list.Template = 'listTemplate';
	// curPopup = popup;
}

function add(text,image)
{
	 // count items in list
	var current = list.ItemsCount; 
	var curplus = current++;
 // create one more item and add the text   
	list.CreateItem(curplus, 3, {Text: text});
	list.CreateItem(curplus, 2, {Image: image});
}

IR.AddListener(IR.EVENT_RECEIVE_TEXT, driver, function(text) 
{
	// IR.Log(isback);
   if(curPopup == 'server')
   {
	temp = JSON.Parse(text);
	//IR.Log(temp.menu_name);
	if(temp.menu_name)
	{
		IR.GetPopup('server').GetItem('Item 2').Text = temp.menu_name;
		IR.GetPopup('server').GetItem('Item 2').Visible = true;
	}
	if(temp.response_code == 0)
	{
		if(temp.max_line)
		{
			if(temp.max_line >= 8)
			{
				if(index<temp.max_line)
				{
					IR.GetPopup('server').GetItem('Item 1').Enable = false;
					for(var i = 0;i<temp.list_info.length;i++)
					{
							// IR.Log(temp.menu_layer);
							if(temp.list_info[i].attribute == '2'||temp.list_info[i].attribute == '125829122')
							{
								add(temp.list_info[i].text,'resource_1.png');
								arr.push('d');
							}
							else
							{
								add(temp.list_info[i].text,temp.list_info[i].thumbnail);
								arr.push('f');                       
							}

					}
					if(temp.list_info.length<8)
					{
					}
					else
					{
						// IR.Log(temp.menu_layer);
						index = index + 8;
						driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index='+index+'&size=8']);
					}   
				}	
			}

/*			else
			{
				IR.GetPopup('server').GetItem('Item 1').Enable = true;
			}*/
			else
			{
				// IR.GetPopup('server').GetItem('Item 1').Enable = false;
				for(var i = 0;i<temp.list_info.length;i++)
				{
						// IR.Log(temp.menu_layer);
						if(temp.list_info[i].attribute == '2'||temp.list_info[i].attribute == '125829122')
						{
							add(temp.list_info[i].text,'resource_1.png',list);
							arr.push('d');
						}
						else
						{
							add(temp.list_info[i].text,temp.list_info[i].thumbnail,list);
							arr.push('f');                        
						}

				}

			}
			if(index+8>temp.max_line)
				IR.GetPopup('server').GetItem('Item 1').Enable = true;
		}
	}
   }
});


IR.AddListener(IR.EVENT_ITEM_SELECT,IR.GetPopup('server').GetItem('List 1'), function(item, subitem) 
{
	if(arr[item]=='d')
	{
		list.Clear();
		createList('server',list);
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
	// back = !back;
	// IR.Log(back+' '+sSelect+' '+nSelect+' '+flag);
	if(temp.menu_layer > 0)
	{
			// IR.Log('need to clear next!');
			index = 0;
			arr.length = 0;
			list.Clear();
			createList('server',list);
			driver.Send(['GET,/YamahaExtendedControl/v1/netusb/setListControl?type=return']);
			driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index=0&size=8']);
	}
	else
	{
		IR.HidePopup("server");
		list.Clear();
		arr.length = 0;
		index = 0;
	}
	// flag = 1;
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetItem("Страница 1").GetItem("server"), function ()
{
	curPopup = 'server';
	list.Clear();
	createList('server',list);
	index = 0;
	driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=server']);
	driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index=0&size=8']);
	IR.ShowPopup('server');  
});

IR.AddListener(IR.EVENT_ITEM_PRESS, IR.GetItem("Страница 1").GetItem("net_radio"), function ()
{
	curPopup = 'server';
	list.Clear();
	createList('server',list);
	index = 0;
	driver.Send(['GET,/YamahaExtendedControl/v1/main/setInput?input=net_radio']);
	driver.Send(['GET,/YamahaExtendedControl/v1/netusb/getListInfo?input=server&index=0&size=8']);
	IR.ShowPopup('server');  
});