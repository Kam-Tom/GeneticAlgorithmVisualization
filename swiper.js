const pages = document.querySelectorAll(".page");

let active = false;
let startingX;
let desktop = false;

activate();
addEventListener('resize',e=>
{
    activate();
});

function activate()
{
    if(window.innerWidth < 800 && active === false)
    {
        active = true;
        pages.forEach((p,i) =>
        {
            p.handTouchStart = (e) => handle_touch_start(e);
            p.handTouchMove = (e) => handle_touch_move(e,i);
            p.handTouchEnd = (e) => handle_touch_end(e,i);

            p.addEventListener('touchstart',p.handTouchStart);
            p.addEventListener('touchmove',p.handTouchMove);
            p.addEventListener('touchend',p.handTouchEnd );

            p.addEventListener('mousedown',p.handTouchStart);
            p.addEventListener('mousemove',p.handTouchMove);
            p.addEventListener('mouseup',p.handTouchEnd );
        });
        
    }
    else if(window.innerWidth > 800 && active === true)
    {
        active = false;
        pages.forEach((p) =>
        {
            p.removeEventListener('touchstart',p.handTouchStart);
            p.removeEventListener('touchmove',p.handTouchMove);
            p.removeEventListener('touchend',p.handTouchEnd);

            p.removeEventListener('mousedown',p.handTouchStart);
            p.removeEventListener('mousemove',p.handTouchMove);
            p.removeEventListener('mouseup',p.handTouchEnd);

            p.handTouchStart = undefined;
            p.handTouchMove = undefined;
            p.handTouchEnd = undefined;
        });
    }
}


function handle_touch_start(e)
{
    if(!e.touches)
        desktop = true;

    startingX = desktop ? e.clientX : e.touches[0].clientX;
    pages.forEach(p=>p.style.transition='');
}

function handle_touch_move(e,i)
{
    if(!e.touches && !desktop)
        return;

    let currentX = desktop ? e.clientX : e.touches[0].clientX;
    let left = (startingX - currentX)>0;
    if(left === true && i > 0)
    {
        //right
        swap_right(e,i);
    }
    else if(left === false && i < pages.length-1)
    {
        //left
        swap_left(e,i);

    }

}
function swap_left(e,i)
{
    let currentX = desktop ? e.clientX : e.changedTouches[0].clientX;
    let change = currentX - startingX;
    pages[i+1].style.display = 'flex';
    pages[i+1].style.left = (change - innerWidth) + 'px';
    pages[i].style.left = change + 'px';
    e.preventDefault();
    
}
function swap_right(e,i)
{
    let currentX = desktop ? e.clientX : e.changedTouches[0].clientX;
    let change = startingX - currentX;
    pages[i-1].style.display = 'flex';
    pages[i-1].style.left = (innerWidth - change) + 'px';
    pages[i].style.left = '-' + change + 'px';
    e.preventDefault();
}


function handle_touch_end(e,i)
{
    let currentX = desktop ? e.clientX : e.changedTouches[0].clientX;
    let left = (startingX - currentX < 0);
    if(left === true && i < pages.length-1)
    {   
        end_left(e,i);
    }
    else if(left === false && i > 0)
    {
        end_right(e,i);
    }
    desktop = false;

}
function end_left(e,i)
{
    let currentX = desktop ? e.clientX : e.changedTouches[0].clientX;
    let change = currentX-startingX;
    let treshold = innerWidth/3;
    if(change < treshold)
    {

        pages[i].style.left = 0;
        pages[i+1].style.left = "-100%";
        pages[i+1].style.display = "none";
    }
    else
    {
        pages[i].style.transition = "all .3s";
        pages[i+1].style.transition = "all .3s";
        pages[i].style.left = "100%";
        pages[i+1].style.left = "0";
        pages[i+1].style.display = 'flex';
    }
}
function end_right(e,i)
{

    let currentX = desktop ? e.clientX : e.changedTouches[0].clientX;
    let change = startingX - currentX;
    let treshold = innerWidth/3;
    if(change < treshold)
    {

        pages[i].style.left = 0;
        pages[i-1].style.left = "100%";
        pages[i-1].style.display = "none";
    }
    else
    {
        pages[i].style.transition = "all .3s";
        pages[i-1].style.transition = "all .3s";
        pages[i].style.left = "-100%";
        pages[i-1].style.left = "0";
        pages[i-1].style.display = 'flex';
    }
}