// Calc
window.onload = function() {
	compute();
};


function twistedatt() {
numwire = Number($("input[name=wires_number]:checked").val());
if (numwire == 1) {
document.getElementById("twistatt").style.backgroundColor = "#FF0000";
}
setTimeout(function() { document.getElementById("twistatt").style.backgroundColor = "" }, 500);
}


function compute(input) {
	var c1 = Number($("input[name=wires_number]:checked").val());
	var c2 = Number($("input[name=coils_number]:checked").val());
	var c3 = Number($("#wire_diam").val());
	var c4 = Number($("#coil_diam").val());
	var c5 = Number($("#windings_number").val());

	var c6 = Number($("#range_1").val());

	var c61 = 1; // резерв

	var c7 = Number($("#legs_length").val());
	var c8 = Number($("#wire_type").val());
	var c9 = Number($("input[name=ct]:checked").val());
	var c10 = Number(document.getElementById("ohmcorrection").checked);
	var c11 = Number(document.getElementById("twisted").checked);
	var pi = 3.14159265359;
	var ohm_correct = 1.1;

	var cldiam = Number($("#clap_w_diam").val());
	var cltype = Number($("#clap_w_type").val());

// Скрыть/Раскрыть панель Клэптона и предупредить о отсутствии Расчетной мощности
if (c9 == 3) {
document.getElementById("clptbar").style.display="table-row";
document.getElementById("clpatt").style.visibility="visible";
} else {
document.getElementById("clptbar").style.display="none";
document.getElementById("clpatt").style.visibility="hidden";
}



// Площадь сечения S mm2
	var r_area = pi * (Math.pow((c3 / 2), 2));

// Длина провода спирали (одного) mm
	var av_diam = c3+c4;
	var r_wirelength = (Math.sqrt(Math.pow((pi*av_diam), 2) + Math.pow(c3*c1*c9, 2) )) * c5 + (c7*2);
	if (c11 == 1 && c1 >= 2) { var r_wirelength = r_wirelength * 1.2; }
	if (c1 == 1) {	document.getElementById("twisted").checked=0; }


// Длинна обмотки Клэптона
	// Длинна жилы вокруг которой будет мотаться Клэптон: r_wirelength
	// Диаметр жилы: c3
	// Количество жил: c1
	// Диаметр обмотки: cldiam
	var clp_wirelength = Math.round(c3 * pi * (r_wirelength / cldiam) * (c1 / 10 * 6 + 0.4));

// Сопротивление обмотки Клэптона
	var clp_area = pi * (Math.pow((cldiam / 2), 2));
	var clp_resist =(cltype * clp_wirelength / clp_area / 100);




// Сопротивление спирали R ом
	var r_resist = (c8 * (r_wirelength+(c1*c3)) / r_area / 1000) / (c2 * c1);
	if (c10 == 1) { var r_resist = r_resist * ohm_correct; }
// Добавляем параллельное сопротивление Клэптона
	if (c9 == 3) { var r_resist = (r_resist * clp_resist) / (r_resist + clp_resist); }


// Мощность P ватт
	var r_power = Math.pow((c6), 2)/r_resist;

// Ток I ампер
	var r_curent = c6/r_resist;

// Ширина спирали mm (за шаг принято сечение провода)
	var r_cowidth = c1 * (c3*c9) * c5;

// Power density (Поверхностная мощность) W/mm²
	var r_powden = r_power / ((pi*2) * ((av_diam/2) * ((c3*2*(c2*c1*1.8)) * c5)));

//
	var mm_ras = (((pi*2) * ((av_diam/2) * ((c3*2*(c2*c1*1.8)) * c5)))) * 0.3;

	var koef = (43 - mm_ras) / 100;
	if (koef <= 0.2) { var koef = 0.2; }

	var den_kon = koef;
	var den_low = koef - 0.05;
	var den_hea = koef + 0.05;
	var den_ovh = koef + 0.1;


// Opt Power (оптимальная мощность)
	var r_optpower = ((pi*2) * ((av_diam/2) * ((c3*2*(c2*c1*1.8)) * c5))) * den_kon;


// Температура спирали К (сухая) отдельно считаем сопротивление и ток для одной спирали
	var a_resist = (c8 * (r_wirelength+(c1*c3)) / r_area / 1000) / (c1);
	if (c10 == 1) { var a_resist = a_resist * ohm_correct; }
	var a_curent = c6/a_resist;
	var r_tempk = Math.pow( (c6 * a_curent) / (0.31 * pi * 5.67 * Math.pow(10, -8) * c3 * Math.pow(10, -3) * r_wirelength * Math.pow(10, -3)), (1/4) );

// Температура спирали C (сухая)
	var r_tempc = r_tempk - 273.15;

// Энергия J (Джоуль) Вт = Дж/с = кг·м²/с³
	var r_enerj = r_power;

// Испарим жидкости за минуту
	var r_vapeliq = 60 / (r_enerj / 631.8) / 10000;

// Температура в цвете
	var c_hsl = (r_tempk /260).toFixed(0);
	var rgb_color = colorTemperatureToRGB(r_tempk);
	var r_tempcolor = "rgb("+(rgb_color['r']).toFixed(0)+","+(rgb_color['g']).toFixed(0)+", "+(rgb_color['b']).toFixed(0)+")";


// Рекомендуемые значения мощности
	var cool_hot = "Optimal";
	var cool_hot_col = "rgb(0,200,0)";
	if (r_powden >= 0.40) {
	var cool_hot = "Heat";
	var cool_hot_col = "rgb(200,180,00)";
	}
	if (r_powden >= 0.45) {
	var cool_hot = "Overheat";
	var cool_hot_col = "rgb(200,0,70)";
	}
	if (r_powden <= 0.2) {
	var cool_hot = "Low";
	var cool_hot_col = "rgb(100,100,200)";
	}



// Greenbar
	var bar_weght = 380;
	var volt_px = 71.6;
	var start_bar = 2.85;
	var barr_correct = start_bar * volt_px;

    var greenbar_ras1 = ((pi*2) * ((av_diam/2) * ((c3*2*(c2*c1*1.8)) * c5))) * 0.2;
    var greenbar_ras2 = ((pi*2) * ((av_diam/2) * ((c3*2*(c2*c1*1.8)) * c5))) * 0.4;
    var greenbar_ras3 = ((pi*2) * ((av_diam/2) * ((c3*2*(c2*c1*1.8)) * c5))) * 0.45;

    var greenbar1 = Math.sqrt(greenbar_ras1 * r_resist) * volt_px - barr_correct;
    if (greenbar1 <= 1) { greenbar1 = 1; }
    if (greenbar1 >= bar_weght) { greenbar1 = bar_weght; }

    var greenbar2 = Math.sqrt(greenbar_ras2 * r_resist) * volt_px - barr_correct - greenbar1;
    var rightdot = greenbar1 + greenbar2;
    if (greenbar2 <= 1) { greenbar2 = 1; }
    if (rightdot >= bar_weght) { greenbar2 = bar_weght - greenbar1; }

    var greenbar3 = Math.sqrt(greenbar_ras3 * r_resist) * volt_px - barr_correct - greenbar1 - greenbar2;
    var rightdot = greenbar1 + greenbar2 + greenbar3;
    if (greenbar3 <= 1) { greenbar3 = 1; }
    if (rightdot >= bar_weght) { greenbar3 = bar_weght - greenbar1 - greenbar2; }

    var bar1 = greenbar1+"px";
    var bar2 = greenbar2+"px";
    var bar3 = greenbar3+"px";

    document.getElementById("tbar1").style.width=bar1;
    document.getElementById("tbar2").style.width=bar2;
    document.getElementById("tbar3").style.width=bar3;


// Цветовое кодирование фона под Мощностью
	var c_r = 0;
	var c_g = Math.round((170 - (20 / r_powden)) * 2);
	var c_b = 0;


	if (r_powden <= 0.17) {
	var c_g = 100;
	}

	if (r_powden <= 0.24) {
	var c_b = Math.round((20 / r_powden) * 2);
	}

	if (r_powden >= 0.35) {
	var c_r = Math.round((70 - (20 / r_powden)) * 10);
	var c_g = Math.round((100 - r_powden*200) * 10);
	}

	if (c_r >= 230) { c_r = 230; }
	if (c_r <= 0) { c_r = 0; }
	if (c_g >= 200) { c_g = 200; }
	if (c_g <= 0) { c_g = 0; }
	if (c_b >= 220) { c_b = 220; }
	if (c_b <= 0) { c_b = 0; }

	var pw_color = "rgb("+c_r+","+c_g+","+c_b+")";
	document.getElementById("pw_color").style.backgroundColor=pw_color;


// Overrate (кратность перегрева)
	var overrate = "";
	if (r_power > r_optpower*2) {
	var overrate = r_power / r_optpower;
	var overrate = " x"+overrate.toFixed()
	}




    //c8
    switch (c8) {
  case 0.09:
    var tc_disp = "0.00520";
		break
  case 0.24:
    var tc_disp = "0.00506";
		break
  case 0.28:
    var tc_disp = "0.00320";
		break
  case 0.36:
    var tc_disp = "0.00405";
		break
  case 0.42:
    var tc_disp = "0.00350";
		break
  case 0.74:
    var tc_disp = "0.00095";
		break
  case 0.8:
    var tc_disp = "0.00105";
		break
  case 1.08:
    var tc_disp = "0.00012";
		break
  case 1.11:
    var tc_disp = "0.00018";
		break
  case 1.39:
    var tc_disp = "0.00004";
		break
  case 1.35:
    var tc_disp = "0.00005";
		break
  case 1.45:
    var tc_disp = "0.00001";
		break
  default:
    var tc_disp = " ";
}


    document.getElementById("tc").textContent = tc_disp;




// Вывод
    document.getElementById("r_resist").textContent = r_resist.toFixed(2);
    document.getElementById("r_wirelength").textContent = r_wirelength.toFixed(2);
    document.getElementById("x_wire").textContent = (c1*c2).toFixed(0);
    document.getElementById("r_power").textContent = r_power.toFixed(2);
    document.getElementById("r_optpower").textContent = r_optpower.toFixed(2);
    document.getElementById("r_curent").textContent = r_curent.toFixed(2);
    document.getElementById("r_powden").textContent = r_powden.toFixed(2);
    document.getElementById("r_cowidth").textContent = r_cowidth.toFixed(1);

	document.getElementById("r_tempk").textContent = r_tempk.toFixed();
	document.getElementById("r_tempcolor").style.backgroundColor=r_tempcolor;

	document.getElementById("cool_hot").textContent = cool_hot+overrate;
	document.getElementById("cool_hot").style.color=cool_hot_col;

	$('.irs-single').css('background', cool_hot_col);

	$('#share').val('http://reprova.com/calc/?a='+c1+'&b='+c2+'&c='+c9+'&d='+c3+'&e='+c4+'&f='+c5+'&g='+c6+'&h='+c61+'&j='+c7+'&k='+c8+'&l='+c10+'&m='+c11+'&n='+cldiam+'&o='+cltype+'');

};
