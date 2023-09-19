import {Graph,Graph2D} from "./graph.js";
import {Genetic} from './genetic.js';
import {add_table,remove_tables} from './utils.js';

let settings;
let graphVars;
let fGraph;
let bGraph;
let step = -1;
let GA;
let currentGeneration = 0;
let intervalId;

let stepDescription = document.getElementById('step-desc');
let stepTableParent = document.getElementById('step-table');

const resetBtn = document.getElementById('reset-button');
const stopBtn = document.getElementById('stop-button');
const startBtn = document.getElementById('start-button');

window.addEventListener('onSettingsChanged', e=> 
{
    settings = e.detail;
    if(intervalId)
    {
        clearInterval(intervalId);
        intervalId = null;
    }
    change_graphs();
    update_graphs();

});
window.addEventListener('resize',e=>
{
    let fGraphHtmlObj = document.getElementById('f-graph');
    let bGraphHtmlObj = document.getElementById('b-graph');

    let bGraphNotDisplayed = bGraphHtmlObj.clientWidth === 0;
    let fGraphNotDisplayed = fGraphHtmlObj.clientWidth === 0;
    //If object is hidden, unhide to get clientWidth
    if(bGraphNotDisplayed)
        bGraphHtmlObj.parentNode.style.display = 'flex';
    if(fGraphNotDisplayed)
        fGraphHtmlObj.parentNode.style.display = 'flex';

    fGraph?.resize(fGraphHtmlObj.clientWidth,fGraphHtmlObj.clientHeight);
    bGraph?.resize(bGraphHtmlObj.clientWidth,bGraphHtmlObj.clientHeight);

    //hide object if needed
    if(bGraphNotDisplayed)
        bGraphHtmlObj.parentNode.style.display = 'none';
    if(fGraphNotDisplayed)
        fGraphHtmlObj.parentNode.style.display = 'none';

});
window.addEventListener('onChangeGraph', e=> 
{
    graphVars = e.detail;
    
    change_graphs();
    update_graphs();
});


function get_params()
{
    let params = [];
    let parent = document.getElementById('limits-dropdown-menu');
    for(let el of parent.children)
    {
        params.push(el.innerHTML);
    }
    return params;
}

function get_points()
{
    let points = [];
    if(GA && GA.pop)
    {
        for(let individual of GA.pop)
        {
            let x,y;
    
            if(graphVars.x !== -1)
                x = individual[graphVars.x]
            else
                x = individual[individual.length-1];
            if(graphVars.y !== -1)
                y = individual[graphVars.y]
            else
                y = individual[individual.length-1];
            
            points.push({x:x,y:y});
    
        }
    }
    return points;
}
function get_best_points()
{
    let points = [];

    if(GA && GA.bests)
    {
        let i = 0;
        for(let individual of GA.bests)
        {
            let x = i;
            let y = individual[individual.length-1]
            
            points.push({x:x,y:y});
            i++;
        }
    }
    return points;
}
function update_graphs()
{
    fGraph?.draw_points(get_points());

    let bestPoints = get_best_points();
    bGraph?.draw_points(bestPoints);

    let curBestText = document.getElementById('current-best');

    if(bestPoints.length > 0)
        curBestText.innerHTML = bestPoints[bestPoints.length-1].y;
    else
        curBestText.innerHTML = "#";

}
function remove_graphs()
{
    if(fGraph)
    {
        let htmlObj = document.getElementById('f-graph').querySelector('svg');
        let parent = htmlObj.parentNode;
        parent.removeChild(htmlObj);
        fGraph = null;
    }
    if(bGraph)
    {
        let htmlObj = document.getElementById('b-graph').querySelector('svg');
        let parent = htmlObj.parentNode;
        parent.removeChild(htmlObj);
        bGraph = null;
    }
}
function get_limits()
{
    let xRange = {min:0,max:0};
    let yRange = {min:0,max:0};
    if(graphVars.x !== -1)
    {
        xRange.min = settings.limits[graphVars.x*2];
        xRange.max = settings.limits[graphVars.x*2+1];
    }
    if(graphVars.y !== -1)
    {
        yRange.min = settings.limits[graphVars.y*2];
        yRange.max = settings.limits[graphVars.y*2+1];
    }
    return [xRange,yRange];
}
function create_2D_graph()
{
    //get lenght of mask
    let mask_len = mask_f(0).length;
    //create empty mask
    let mask = new Array(mask_len).fill(0);

    let mask1 = mask_f(graphVars.x);
    let mask2 = mask_f(graphVars.y);

    //Combine masks
    for(let i=0;i<mask.length;i++)
        if(mask1[i] === 1 || mask2[i] === 1)
            mask[i] = 1;
    
    let f2D = function(x,y)
    {
        
        mask[graphVars.x] = x;
        mask[graphVars.y] = y;
        
        if(graphVars.x < graphVars.y)
            [x,y] = [y,x];
                
        return settings.f(...mask);
        
    }

    return f2D;
 
}
function create_1D_graph(idx)
{
    //get lenght of mask
    let mask_len = mask_f(0).length;
    //create empty mask
    let mask = new Array(mask_len).fill(0);
    let f1D = function(x)
    {

        mask[idx] = x;
        return settings.f(...mask);
    }
    return f1D;
}
function change_graphs()
{

    if(!settings)
        return;
    
    //remove old graphs
    remove_graphs();

    //and create new
    create_f_graph();
    create_b_graph();

}
function create_f_graph()
{
    //Get limits
    let [xRange,yRange] = get_limits();
    let htmlObj = document.getElementById('f-graph');
    
    
    let f;
    //Create 2D function
    if(graphVars.x !== -1 && graphVars.y !== -1)
        f = create_2D_graph();
    else if(graphVars.x !== -1)
        f = create_1D_graph(graphVars.x);
    else
        f = create_1D_graph(graphVars.y);


    let objNotDisplayed = htmlObj.clientWidth === 0;
    //If object is hidden, unhide to get clientWidth
    if(objNotDisplayed)
        htmlObj.parentNode.style.display = 'flex';

    if(graphVars.x !== -1 && graphVars.y !== -1)
        fGraph = new Graph2D(htmlObj,htmlObj.clientWidth,htmlObj.clientHeight);
    else
        fGraph = new Graph(htmlObj,htmlObj.clientWidth,htmlObj.clientHeight,"Dotted");

    if(objNotDisplayed)
        htmlObj.parentNode.style.display = 'none';
    
    
    fGraph.add_scale({xMin:xRange.min,xMax:xRange.max,yMin:yRange.min,yMax:yRange.max});
    fGraph.draw_function(f);
}
function create_b_graph()
{
    let htmlObj = document.getElementById('b-graph');

    let objNotDisplayed = htmlObj.clientWidth === 0;
    //If object is hidden, unhide to get clientWidth
    if(objNotDisplayed)
        htmlObj.parentNode.style.display = 'flex';
    
    bGraph = new Graph(htmlObj,htmlObj.clientWidth,htmlObj.clientHeight,"Line");
    bGraph.add_scale({xMin:0,xMax:settings.maxGenerations,yMin:0,yMax:0});

    if(objNotDisplayed)
        htmlObj.parentNode.style.display = 'none';

}

resetBtn.addEventListener('click',()=>
{

    currentGeneration = 0;
    step = -1;
    GA = null;
    remove_tables(stepTableParent);
    stepDescription.innerHTML = 'Genetic algorithm visualization';
    change_graphs();
    update_graphs();
    //stop interval
    if(intervalId)
    {
        clearInterval(intervalId);
        intervalId = null;
    }
});


stopBtn.addEventListener('click',()=>
{
    //stop interval
    if(intervalId)
    {
        clearInterval(intervalId);
        intervalId = null;
    }
});
startBtn.addEventListener('click',e=>
{
    if(step === -1)
    {
        GA = new Genetic(settings);
        GA.create_random_pop();
        step++;
    }


    if(settings.startMethod === "One Step")
        one_step();
    if(settings.startMethod === "Auto Slow")
        auto(500);
    if(settings.startMethod === "Auto Fast")
        auto(100);
    if(settings.startMethod === "One Generation")
        one_generation();

});

function auto(delay)
{
    if(intervalId)
    {
        clearInterval(intervalId);
        intervalId = null;
    }
    
    if (currentGeneration > settings.maxGenerations)
        return;

    intervalId = setInterval(function() {
        one_generation();
        // Check condition and stop interval
        if (currentGeneration > settings.maxGenerations) {
          clearInterval(intervalId);
        }
      }, delay);
}

function one_step()
{
    if(step === 0)
    {
        remove_tables(stepTableParent);
        stepDescription.innerHTML = 'Step 0: Creating Random Population <br>In the first step, we generate a set of random solutions as our initial population. These solutions cover a range of possibilities and serve as the starting point for the genetic algorithm. Afterward, we evaluate and sort these solutions based on their quality to prepare for the next steps of the algorithm.';
        let params = get_params();
        params.push('<i>f()</i>');
        let table = [].concat.apply([], GA.pop);
        add_table(params,table,stepTableParent);
        step++;
        update_graphs();
    }
    else if(step === 1)
    {
        remove_tables(stepTableParent);
        GA.select_tmp();
        stepDescription.innerHTML = 'Step 1: Selecting Population for Crossover <br> In this stage, we pick a subset of individuals from the population, based on their fitness <i>\'f()\'</i>. These selected individuals will be paired up for crossover, where their genetic information is combined to create new potential solutions in the next step of the genetic algorithm.';
        let params = get_params();
        params.push('<i>f()</i>');
        let table = [].concat.apply([], GA.tmpPop);
        add_table(params,table,stepTableParent);
        step++;
    }
    else if(step === 2)
    {
        remove_tables(stepTableParent);
        GA.cross();
        stepDescription.innerHTML = 'Step 2: Performing Crossover Operation <br> During this phase, pairs of selected individuals from the population, often referred to as parents, are brought together. Their genetic information is exchanged, mimicking the idea of mixing and recombining traits. This crossover process generates new offspring with combined features, enhancing the diversity and exploration potential within the population.';
        let params = get_params();
        params.push('<i>f()</i>');
        let table = [].concat.apply([], GA.childPop);
        add_table(params,table,stepTableParent);
        step++;
    }
    else if(step === 3)
    {
        remove_tables(stepTableParent);
        GA.mutate();
        stepDescription.innerHTML = 'Step 3: Performing Mutation Operation <br> In this step, we take an individual from the population and make a small random change to its genetic information. This change introduces variation into the population, helping us explore new areas of the solution space beyond what\'s defined by crossover';
        let params = get_params();
        params.push('<i>f()</i>');
        let table = [].concat.apply([], GA.childPop);
        add_table(params,table,stepTableParent);
        step++;
    }
    else if(step === 4)
    {
        remove_tables(stepTableParent);
        GA.marge();
        stepDescription.innerHTML = 'Step 4: Merging Child Population <br> In this step, we combine the new offspring (child population) generated through crossover and mutation with the existing parent population. This mixture creates a larger and more diverse group of potential solutions, setting the stage for the next rounds of selection and evolution in the genetic algorithm.';
        let params = get_params();
        params.push('<i>f()</i>');
        let table = [].concat.apply([], GA.pop);
        add_table(params,table,stepTableParent);
        step++;
    }
    else if(step === 5)
    {
        remove_tables(stepTableParent);
        GA.sort();
        stepDescription.innerHTML = 'Step 5: Sorting <br>After merging the populations, we arrange all the potential solutions in order of their fitness <i>\'f()\'</i>, with the best solutions at the top. This sorting helps us identify the strongest candidates and prepares us for the crucial selection process that determines which solutions will carry forward to the next generation.';
        let params = get_params();
        params.push('<i>f()</i>');
        let table = [].concat.apply([], GA.pop);
        add_table(params,table,stepTableParent);
        step++;
    }
    else if(step === 6)
    {
        remove_tables(stepTableParent);
        GA.crop_pop();
        stepDescription.innerHTML = 'Step 6: Cropping <br> Following sorting, we retain only the top-performing solutions from the combined population, often based on a predetermined percentage or a specific number. This cropping step trims away weaker solutions, focusing our resources on the most promising candidates as we move forward in the genetic algorithm process.';
        let params = get_params();
        params.push('<i>f()</i>');
        let table = [].concat.apply([], GA.pop);
        add_table(params,table,stepTableParent);
        step++;
    }
    else if(step === 7)
    {
        currentGeneration++;
        stepDescription.innerHTML = 'Step 7: Visualizing <br>In this step, we take a visual approach to understand how our solutions are performing. By plotting the fitness values of the individuals in the population on a graphs';
        update_graphs();
        step = 1;
    }
}
function one_generation()
{
    GA.select_tmp();
    GA.cross();
    GA.mutate();
    GA.marge();
    GA.sort();
    GA.crop_pop();
    currentGeneration++;
    update_graphs();
}

function mask_f(idx)
{
    let fText = settings.f.toString();
    let startIdx = fText.indexOf('(');
    let endIdx = fText.indexOf(')',startIdx+1);
    let varsText = fText.substr(startIdx+1,endIdx-startIdx-1);
    let vars = varsText.trim().split(',');
    
    let mask = new Array(vars.length).fill(0);
    
    mask[idx] = 1;

    startIdx = fText.indexOf('let v = ');
    endIdx = fText.indexOf(';');
    let fBodyText = fText.substr(startIdx+8,endIdx-startIdx-8);
    
    let plusSplit = fBodyText.split('+');
    for(let i=0;i<mask.length;i++)
    {
        for(let j=0;j<plusSplit.length;j++)
        {
        let split = plusSplit[j].split(/[,().*/]/);
            if(split.includes(vars[idx]) && split.includes(vars[i]))
                mask[i] = 1;

        }
    }
    return mask;
    
}