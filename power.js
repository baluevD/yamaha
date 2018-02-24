var status;
var page = IR.GetPage("Страница 1");

IR.AddListener(IR.EVENT_ITEM_PRESS, page.GetItem("power"), function ()
{
    if(page.GetItem("power").Value == 1)
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setPower?power=on']);
    else
        driver.Send(['GET,/YamahaExtendedControl/v1/main/setPower?power=standby']);
});

IR.AddListener(IR.EVENT_START,0,function()
{
    driver.Send(['GET,/YamahaExtendedControl/v1/main/getStatus']);
});

IR.AddListener(IR.EVENT_RECEIVE_TEXT, driver, function(text) 
{  
    status = JSON.Parse(text);
    if(status.power == 'on')
        page.GetItem("power").Value = 1;
    if(status.power == 'standby')
        page.GetItem("power").Value = 0;
});