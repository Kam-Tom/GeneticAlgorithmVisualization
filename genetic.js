
export {Genetic};
// import {normal_distribution} from './utils.js';
//sequence of algorithm
//  1 - create random population
//  2 - selectin tmp population for crossing
//  3 - creating child population by crossing tmp population
//  4 - adding mutations on child population 
//  5 - marging old population and child population
//  6 - sorting and selecting only bests as new population

class Genetic
{
    #settings;
    #bests;
    #cPop;
    #pop;
    #tmpPop;

    get pop()
    {
        return this.#addEvaluation(this.#pop);
    }
    #addEvaluation(pop)
    {
        let values = this.evaluate(pop);
        let popWithEval = pop.map((p,idx) => [...p,values[idx]]);
        return popWithEval;
    }
    get childPop()
    {
        return this.#addEvaluation(this.#cPop);
    }
    get tmpPop()
    {
        return this.#addEvaluation(this.#tmpPop);
    }
    get bests()
    {
        return this.#addEvaluation(this.#bests);
    }
    constructor(settings)
    {
        this.#settings = settings;
        this.#pop = [];
        this.#bests = [];
    }

    create_random_pop()
    {
        for(let i = 0;i < this.#settings.parentPop;i++)
        {
            let genotype = [];
            //We need to create random value for every gen in genotype
            for(let j=0;j<this.#settings.limits.length;j+=2)
            {
                let randomValue = Math.random() * (this.#settings.limits[j+1] - this.#settings.limits[j] ) + this.#settings.limits[j];
                genotype.push(randomValue);
            }
            this.#pop.push(genotype);
        }
        //we are sorting to add best genetype for your bests list
        this.sort();
    }

    //selecting temporart popuilation for crossing
    select_tmp()
    {
        this.#tmpPop = [];
    
        if(this.#settings.selectionMethod === "Roulette Wheel")
            this.#roulette_wheel_selection();
        if(this.#settings.selectionMethod === "Rank Selection")
            this.#rank_selection();
        if(this.#settings.selectionMethod === "Tournament")
            this.#tournament_selection();
        if(this.#settings.selectionMethod === "Random")
            this.#random_selection();

    
    }
    #random_selection()
    {
        for(let i=0;i<this.#settings.childrenPop;i++)
        {
            let r = this.#pop[Math.floor(Math.random()*this.#pop.length)];
            this.#tmpPop.push(r);
        }
    }
    #tournament_selection()
    {
        const tournamentSize = 4;

        for (let i = 0; i < this.#settings.childrenPop; i++) 
        {
            let participants = [];

            // Select random individulas for the tourament
            for (let j=0;j<tournamentSize;j++)
            {
                let rdnIdx = Math.floor(Math.random()*this.#pop.length);
                participants.push(this.#pop[rdnIdx]);
            }

            // Find the winner in the tournament
            let winner = participants.reduce((best, current) => {
                return this.evaluate_one(current) < this.evaluate_one(best) ? current : best;
            });

            this.#tmpPop.push(winner);
        }
    }
    #rank_selection()
    {
        console.log(this.#settings.selectionMethod + " not implemented");
    }
    #roulette_wheel_selection()
    {

        let costs = this.evaluate(this.#pop);


        //find if there are negative values
        let min_value = Math.min(...costs);
        min_value = min_value < 0 ? -min_value : 0;
        //remove negative values
        costs = costs.map(x => x + min_value);

        let sum = costs.reduce((a,b) => a+b,0)

        let probs = costs.map(cost => cost/sum);

        let cumsum = new Array(probs.length).fill(0);
        cumsum[0] = probs[0];
        for(let i=1;i<cumsum.length;i++)
            cumsum[i] = cumsum[i-1] + probs[i];
        
        
        for(let i=0;i<this.#settings.childrenPop;i++)
        {
            let r = Math.random();
            let idx = -1;

            for(let j=0;j < cumsum.length;j++)
            {
                if(r <= cumsum[j])
                {
                    idx = j;
                    break;
                }
            }

            if(idx !== -1)
                this.#tmpPop.push(this.#pop[idx]);
        }
    }


    //crossing population
    cross()
    {
        this.#cPop = [];
    

        // mask = need to set alpha for every gen 

        let mask = this.#get_mask();
        let i=0;

        while(this.#cPop.length < this.#settings.childrenPop)
        {
            //creating 2 offsprings from 2 parants
            if(i === this.#settings.childrenPop - 1)
                i--;
            let [x,y] = this.#cross_two(this.#tmpPop[i++],this.#tmpPop[i++],mask);
            if(this.#cPop.length < this.#settings.childrenPop)
                this.#cPop.push(x);
            if(this.#cPop.length < this.#settings.childrenPop)
                this.#cPop.push(y);

        }

    }

    //mask for crossing
    #get_mask(gamma = 0.1)
    {
        let mask = [];

        let alpha = -gamma + Math.random()*(1+2*gamma);
        let maskLen = Math.round(this.#settings.limits.length/2);
        if(this.#settings.crossoverMethod == "One-point")
        {
            let splitPoint = Math.round(Math.random()*maskLen); 

            for(let i=0 ;i< splitPoint;i++)
                mask.push(alpha); 
            for(let i=splitPoint ;i< maskLen;i++)
                mask.push(1-alpha); 
        }
        else if(this.#settings.crossoverMethod == "Two-point")
        {
            let splitPoint1 = Math.round(Math.random()*maskLen);
            let splitPoint2 = Math.round(Math.random()*maskLen);
            if(splitPoint1 > splitPoint2)
                [splitPoint1,splitPoint2] = [splitPoint2,splitPoint1]
    
            for(let i=0 ;i< splitPoint1;i++)
                mask.push(alpha); 
            for(let i=splitPoint1 ;i< splitPoint2;i++)
                mask.push(1-alpha); 
            for(let i=splitPoint2 ;i< maskLen;i++)
                mask.push(alpha); 

        }
        else if(this.#settings.crossoverMethod == "Uniform")
        {
            for(let i=0 ;i< maskLen;i++)
            {
                
                if(Math.random() > 0.5)
                    mask.push(alpha); 
                else
                    mask.push(1-alpha);
            }
        }
        else if(this.#settings.crossoverMethod == "None")
        {
            for(let i=0 ;i< maskLen;i++)
            {

                mask.push(1);
            }
        }
        
        return mask;
    }

    //creating 2 offsprings by crossing 2 parents
    #cross_two(a,b,mask)
    {
        let new_two = [];
        let gensLen = Math.round(this.#settings.limits.length/2);
        for(let i = 0;i < 2;i++)
        {
            let genotype = [];
            //We need to create random value for every gen in genotype
            for(let j=0;j<gensLen;j++)
            {
                let value = (mask[j])*a[j] + (1-mask[j])*b[j];
                //clamping to limit
                value = Math.max(this.#settings.limits[j*2],Math.min(this.#settings.limits[j*2+1],value));
                genotype.push(value);
            }

            new_two.push(genotype);
        }

        return new_two;
    }

    mutate()
    {

        let sigma = 0.1;
        for(let i=0;i<this.#settings.childrenPop;i++)
        {
            this.#mutate_genotype(this.#cPop[i],sigma);
        }


    }
    #mutate_genotype(genotype,sigma)
    {
        for(let i=0;i<genotype.length;i++)
        {
            if(Math.random()*100 < this.#settings.mutationProbalility)
            {
                let mutation = Math.random() * (this.#settings.limits[i*2+1] - this.#settings.limits[i*2]);
                mutation -= this.#settings.limits[i*2];
                genotype[i] += sigma * mutation;
                genotype[i] = Math.max(this.#settings.limits[i*2],Math.min(this.#settings.limits[i*2+1],genotype[i]));
            }
        }
    }


    sort()
    {
        this.#pop.sort((a,b) => {return this.#settings.f(...b)-this.#settings.f(...a)});
        this.#bests.push(this.#pop[0]);
    }
    marge()
    {
        this.#pop = [...this.#pop,...this.#cPop];
    }
    crop_pop()
    {
        this.#pop = this.#pop.slice(0,this.#settings.parentPop);
    }

    evaluate(population)
    {
    
        let values = [];
        for(let i=0;i<population.length;i++)
        {
            let v = this.#settings.f(...population[i]);
            values.push(v);
        }
        return values;
    }
    evaluate_one(genotype)
    {
        return this.#settings.f(...genotype);
    }
    

}


export default Genetic;