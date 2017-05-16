class Comp extends React.Component{
    constructor(...arg){
        super(...arg);
    }
    render(){
        return <div>
            Hello……
        </div>;
    }
}

ReactDOM.render(
    <Comp />,
    document.getElementById('box')
)