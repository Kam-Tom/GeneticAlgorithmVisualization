export{parse_function,add_table,remove_tables};

function tokenize(expression) {
    const tokens = [];
    let currentToken = '';
    const operators = ['+', '-',',', '*', '/','^','%','(',')'];
    const functions = ['sin','cos','tan','acos','atan','asin','atanh','sinh','cosh','asinh','acosh','atan','pow','sqrt','abs','ceil','cbrt','exp','log'];
    const constants = ['e','ln10','ln2','pi','E','LN10','LN2','PI']
  
    const pushToken = (token) => 
    {
        if (token === '')
            return;
            
        if(constants.includes(token))
            token = token.toUpperCase();
            // token = "Math." + token;
        

        tokens.push(token);
      
    };

    //Tokenize
    for (let i = 0; i < expression.length; i++) 
    {
        const char = expression[i];
  
        if (char === ' ')
            continue;  
    
        if(operators.includes(char)) 
        {
          pushToken(currentToken);
          tokens.push(char);
          currentToken = '';
          continue;
        }

        currentToken += char;
    }
    pushToken(currentToken);

    
    //Add *
    for (let i = 0; i < tokens.length; i++) 
    {
        

        if(tokens[i] === '(' && i > 0)
        {
            if(!functions.includes(tokens[i-1]) && !operators.includes(tokens[i-1]) && tokens[i-1])
            {
                
                tokens.splice(i, 0, '*');
                i++;
            }
        }
        
        if(tokens[i] === ')' && i < tokens.length)
        {
            if(!functions.includes(tokens[i+1]) && !operators.includes(tokens[i+1]) && tokens[i+1] )
            {
                tokens.splice(i+1, 0, '*');
            }
        }

        if(functions.includes(tokens[i]))
            continue;

        if(tokens[i] === "^")
        {
            tokens[i] = "**";
            continue;
        }
        
        //IF token isnt function and operator yy -> y*y
        let token = tokens[i];
        let newTokens = [];
        for (let j = 0; j < token.length; j++)
        {

            let numericToken = '';
            while(!isNaN(token[j]) || token[j] === '.')
            {

                numericToken += token[j];
                j++;
            }
            if(numericToken !== '')
            {
                newTokens.push(numericToken);
                j--;

                if(j < token.length-1)
                    newTokens.push("*");
                continue;
            }
            
            newTokens.push(token[j]);

            if(j < token.length-1)
                newTokens.push("*");
        } 
        
        tokens.splice(i, 1,...newTokens);
        
        
        
    }

    const vars = new Set();
    for (let i = 0; i < tokens.length; i++) 
    {
        if(operators.includes(tokens[i]))
            continue;
        if(functions.includes(tokens[i]))
            continue;
        if(constants.includes(tokens[i]))
            continue;
        if(!isNaN(tokens[i]))
            continue;
        
        vars.add(tokens[i]);
    }

    //Adding Math.
    for (let i = 0; i < tokens.length; i++) 
    {
        if(functions.includes(tokens[i]))
            tokens[i] = 'Math.' + tokens[i];

        if(constants.includes(tokens[i]))
            tokens[i] = 'Math.' + tokens[i];
    }



    return [tokens,vars];
  }
function parse_function(f)
{
    const [tokens,vars] = tokenize(f);
    // Number.NaN
    try 
    {

        return [new Function([...vars],
        `
        {
            let v = ${tokens.join('')};
            if(v === Number.POSITIVE_INFINITY)
              v = Number.MAX_SAFE_INTEGER;
            if(v === Number.NEGATIVE_INFINITY)
              v = Number.MIN_SAFE_INTEGER;
            if(isNaN(v))
              v = 0;
            return v;
        }`
        ),vars];

    } 
    catch(e) 
    {
        if (e instanceof SyntaxError) {
            alert(e.message);
            return [null,null];
        }
    }
}


function remove_tables(container)
{
  container.innerHTML = '';
}
function add_table(headers,data,container)
{

    const table = document.createElement('table');

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    
    // Loop through the header titles and create table header cells
    for (let i = 0; i < headers.length; i++) 
    {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = headers[i];
        headerRow.appendChild(headerCell);
    }
    
    const tbody = table.createTBody();

    for (let i = 0; i < data.length;) 
    {
        const row = tbody.insertRow();
        for (let j = 0; j < headers.length; j++,i++) 
        {
            const cell = row.insertCell()
            cell.textContent = data[i];
        }
    }

    container.appendChild(table);
}
function normal_distribution() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
  
    var z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z;
}