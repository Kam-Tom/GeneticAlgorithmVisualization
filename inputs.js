// import {get_params} from './utils.js';
import { parse_function } from "./utils.js";

const settings = 
{
    f:"x*x+y*y",
    limits:[-10,10,-10,10],
    maxGenerations:100,
    startMethod:"Auto Slow",
    parentPop:100,
    childrenPop:100,
    mutationProbalility:50,
    crossoverMethod:"One-point",
    selectionMethod:"Random"
};

const onSettingsChanged = new CustomEvent('onSettingsChanged', { detail:settings});

const graphVars = {x:0,y:-1}
const onChangeGraph = new CustomEvent('onChangeGraph', { detail:graphVars});

// window.dispatchEvent(onSettingsChanged);


// window.dispatchEvent(onChangeGraph);
init_dropdown();
get_f_inputs();

window.dispatchEvent(onSettingsChanged);
window.dispatchEvent(onChangeGraph);


function init_dropdown()
{

    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(d => 
    {
        const caret = document.createElement('span');
        caret.classList.add('caret');
        d.appendChild(caret);

        const parent = d.parentNode;
        const menu = parent.querySelector('.dropdown-menu');
        d.addEventListener('click',e=>
        {
            dropdowns.forEach(tmpD =>
            {
                if(d === tmpD)
                    return;

                const parent = tmpD.parentNode;
                const menu = parent.querySelector('.dropdown-menu');
                menu.style.display='none';

            });
            if(menu.style.display === 'flex')
                menu.style.display='none';
            else
                menu.style.display='flex';
            
        }); 
        init_dropdown_menu(d,menu);

    });
}
function init_dropdown_menu(dropdown,menu)
{


    const options = menu.querySelectorAll('span');
    options.forEach(o=>
    {
        o.addEventListener('click',e=>
        {
            if(dropdown.id === 'f-body')
            {
                const f_input = document.getElementById('f-input');
                f_input.value = o.innerHTML;
                menu.style.display='none';
                get_f_inputs();
                refresh_limits();
                change_setting();
                return;
            }
            if(dropdown.id === 'v1-graph-input' || dropdown.id === "v2-graph-input")
            {
                dropdown.innerHTML = o.innerHTML;

                const caret = document.createElement('span');
                caret.classList.add('caret');
                dropdown.appendChild(caret);
                change_f_vars();
                menu.style.display='none';
                return;
            }

            dropdown.innerHTML = o.innerHTML;


            const caret = document.createElement('span');
            caret.classList.add('caret');
            dropdown.appendChild(caret);

            menu.style.display='none';

            change_setting();
        });
    });
}
function change_f_vars()
{
    for(let i=1;i<3;i++)
    {
        let v = -1;
        const inputValue = remove_caret(document.getElementById(`v${i}-graph-input`).innerHTML); 
        let parent = document.getElementById(`v${i}-dropdown-menu`);
        
        let nr=0;
        for(const param of parent.children)
        {
            if(param.innerHTML === inputValue && param.innerHTML !== '-')
            {
                v = nr;
                break;
            }
            nr += 1;
        }

        if(i == 1)
            graphVars.x = v;
        else
            graphVars.y = v;
    
    }

    window.dispatchEvent(onChangeGraph);
}
function change_setting()
{

    
    const maxGen = parseInt(document.getElementById('max-generations-input').value);
    settings.maxGenerations = maxGen >= 0 ? maxGen : parseInt(document.getElementById('max-generations-input').placeholder);
    
    const pPop = parseInt(document.getElementById('parent-population-input').value);
    settings.parentPop = pPop >= 0 ? pPop : parseInt(document.getElementById('parent-population-input').placeholder);

    const cPop = parseInt(document.getElementById('children-population-input').value);
    settings.childrenPop = cPop >= 0 ? cPop : parseInt(document.getElementById('children-population-input').placeholder);

    const mProp = parseInt(document.getElementById('mutation-probalility-input').value);
    settings.mutationProbalility = mProp >= 0 ? mProp : parseInt(document.getElementById('mutation-probalility-input').placeholder);

    
    settings.startMethod = remove_caret(document.getElementById('start-method-input').innerHTML);
    settings.crossoverMethod = remove_caret(document.getElementById('crossover-method-input').innerHTML);
    settings.selectionMethod = remove_caret(document.getElementById('selection-method-input').innerHTML);

    window.dispatchEvent(onSettingsChanged);
}
function remove_caret(input)
{
    const caretIndex = input.indexOf('<span class="caret"></span>');
    const value = input.substring(0, caretIndex);
    return value;
}
function get_f_inputs()
{
    
    const f_value = document.getElementById('f-input').value || document.getElementById('f-input').placeholder;
    const [f,vars] = parse_function(f_value);

    if(!vars || !f ||vars.size === 0)
        return;

    settings.f = f;

    const limits = [...settings.limits];
    settings.limits = new Array(vars.size * 2);

    for(let i=0; i< settings.limits.length; i++)
    {

        if(i < limits.length)
        {
            settings.limits[i] = limits[i];
        }
        else if(i % 2 == 0)
            settings.limits[i] = -10;
        else
            settings.limits[i] = 10;
         
    }

    //Update limit dropdown
    create_limits(vars);

    //Update function params
    create_f_vars(vars);
    change_f_vars();

}
function create_limits(vars)
{
    const currParam = document.getElementById('f-limits');
    const paramsParent = document.getElementById('limits-dropdown-menu');
    paramsParent.innerHTML  = '';
    for(const param of vars)
    {
        const paramEl = document.createElement('span');
        paramEl.innerHTML = param;
        paramEl.addEventListener('click' , e =>
        {
            currParam.innerHTML = paramEl.innerHTML;
            const caret = document.createElement('span');
            caret.classList.add('caret');
            currParam.appendChild(caret);
            paramsParent.style.display = 'none';
            refresh_limits();
        });
        paramsParent.appendChild(paramEl);
    }
    currParam.innerHTML = paramsParent.firstChild.innerHTML;
    
    //Add caret because we deleted it with innerHtml
    const caret = document.createElement('span');
    caret.classList.add('caret');
    currParam.appendChild(caret);
}
function create_f_vars(vars)
{
    for(let i=1;i<3;i++)
    {
        const currParam = document.getElementById(`v${i}-graph-input`);
        const paramsParent = document.getElementById(`v${i}-dropdown-menu`);
        paramsParent.innerHTML  = '';
        for(const param of vars)
        {
            const paramEl = document.createElement('span');
            paramEl.innerHTML = param;
            paramEl.addEventListener('click' , e =>
            {
                currParam.innerHTML = paramEl.innerHTML;
                const caret = document.createElement('span');
                caret.classList.add('caret');
                currParam.appendChild(caret);
                change_f_vars();
                f();
                paramsParent.style.display = 'none';
                // refresh_limits();
            });
            paramsParent.appendChild(paramEl);
        }
        currParam.innerHTML = paramsParent.firstChild.innerHTML;
        
        //Add caret because we deleted it with innerHtml
        const caret = document.createElement('span');
        caret.classList.add('caret');
        currParam.appendChild(caret);
    }

    const currParam = document.getElementById(`v2-graph-input`);
    const caret = document.createElement('span');
    caret.classList.add('caret');
    currParam.innerHTML = '-';
    currParam.appendChild(caret);
    f();

    function f()
    {
        const v1params = document.getElementById(`v1-dropdown-menu`).children;
        const v2params = document.getElementById(`v2-dropdown-menu`).children;
        const currParam1 = remove_caret(document.getElementById(`v1-graph-input`).innerHTML);
        const currParam2 = remove_caret(document.getElementById(`v2-graph-input`).innerHTML);
        for(let i=0; i<v1params.length; i++)
        {
            if(v1params[i].innerHTML === '-')
                v1params[i].innerHTML = v2params[i].innerHTML;
            if(v2params[i].innerHTML === '-')
                v2params[i].innerHTML = v1params[i].innerHTML;
            
            if(currParam1 === v2params[i].innerHTML)
            {
                v2params[i].innerHTML = '-';
            }
            if(currParam2 === v1params[i].innerHTML)
                v1params[i].innerHTML = '-';
        }
    }



}
function refresh_limits()
{
    const minInput = document.getElementById('f-min-input');
    const maxInput = document.getElementById('f-max-input');
    const currParam = document.getElementById('f-limits').innerHTML;
    const parent = document.getElementById('limits-dropdown-menu');
    const caretIndex = currParam.indexOf('<span class="caret"></span>');
    const value = currParam.substring(0, caretIndex);
    let nr=0;
    for(const param of parent.children)
    {
        if(param.innerHTML === value)
            break;
        nr += 2;
    }
    
    minInput.value = settings.limits[nr];
    maxInput.value = settings.limits[nr+1];

}
function save_limits()
{
    const minInput = document.getElementById('f-min-input');
    const maxInput = document.getElementById('f-max-input');
    const currParam = document.getElementById('f-limits').innerHTML;
    const parent = document.getElementById('limits-dropdown-menu');
    const caretIndex = currParam.indexOf('<span class="caret"></span>');
    const value = currParam.substring(0, caretIndex);
    let nr=0;
    for(const param of parent.children)
    {
        if(param.innerHTML === value)
            break;
        nr += 2;
    }
    
    let [min,max] = [parseFloat(minInput.value !== '' ? minInput.value:'-10'),parseFloat(maxInput.value !== '' ? maxInput.value:'10')];
    if(min > max)
        [min,max] = [max,min]


    settings.limits[nr] = min;
    settings.limits[nr+1] = max;
    
    minInput.value = min;
    maxInput.value = max;

}
init_inputs();
function init_inputs()
{
    //function input
    const fInput = document.getElementById('f-input');
    fInput.addEventListener('change', e =>
    {
        get_f_inputs();
        refresh_limits();
        window.dispatchEvent(onSettingsChanged);
    });

    //limits input
    const minInput = document.getElementById('f-min-input');
    const maxInput = document.getElementById('f-max-input');
    minInput.addEventListener('change', e =>
    {
        save_limits();
        window.dispatchEvent(onSettingsChanged);
        // change_setting();
    });
    maxInput.addEventListener('change', e =>
    {
        save_limits();
        window.dispatchEvent(onSettingsChanged);
        // change_setting();
    });

    //Max generations input
    const maxGenInput = document.getElementById('max-generations-input');
    maxGenInput.addEventListener('change', e =>
    {
        if(maxGenInput.value < 0)
            maxGenInput.value = 0;

        maxGenInput.value = parseInt(maxGenInput.value);
        change_setting();
    });
    //mutation prob input
    const mutationProbInput = document.getElementById('mutation-probalility-input');
    mutationProbInput.addEventListener('change', e =>
    {
        if(mutationProbInput.value < 0)
            mutationProbInput.value = 0;
        if(mutationProbInput.value > 100)
            mutationProbInput.value = 100;

        mutationProbInput.value = parseInt(mutationProbInput.value);
        change_setting();
    });
    //Parent pop input
    const parentPopInput = document.getElementById('parent-population-input');
    parentPopInput.addEventListener('change', e =>
    {
        if(parentPopInput.value < 0)
            parentPopInput.value = 0;

        parentPopInput.value = parseInt(parentPopInput.value);
        change_setting();
    });
    //Child pop input
    const childPopInput = document.getElementById('children-population-input');
    childPopInput.addEventListener('change', e =>
    {
        if(childPopInput.value < 0)
            childPopInput.value = 0;

        childPopInput.value = parseInt(childPopInput.value);
        change_setting();
    });
}
