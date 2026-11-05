// @ts-nocheck
"use client";
import { useEffect } from "react";

/** The cost calculator on /performance. The function body is the reference build's script, unchanged. */
export default function CalculatorScript() {
  useEffect(() => {
  var SOL=85, RPB=6960, HDR=128;
  var P={'openai/gpt-5-mini':[2.5e-7,2e-6],'anthropic/claude-haiku-4.5':[1e-6,5e-6],'google/gemini-2.5-flash':[3e-7,2.5e-6],'qwen/qwen3-235b-a22b-2507':[9e-8,5.5e-7],'deepseek/deepseek-v4-flash':[3e-8,1.28e-6],'anthropic/claude-opus-5.5':[4e-6,2e-5],'meta-llama/llama-4-maverick':[1.875e-7,6.525e-7]};
  var BUDGET=['openai/gpt-5-mini','anthropic/claude-haiku-4.5','google/gemini-2.5-flash','qwen/qwen3-235b-a22b-2507','deepseek/deepseek-v4-flash'];
  var $=function(i){return document.getElementById(i)};
  function seat(m,i,o){return P[m][0]*i+P[m][1]*o}
  function calc(){
    var n=+$('c_n').value||1,i=+$('c_in').value||0,o=+$('c_out').value||0,t=$('c_tier').value,prove=$('c_prove').checked,jev=$('c_jev').checked,esc=Math.max(0,Math.min(100,+$('c_esc').value||0))/100,m=+$('c_m').value||0;
    var jury=0;for(var k=0;k<n;k++){var mod=t==='budget'?BUDGET[k%BUDGET.length]:t==='flag'?'anthropic/claude-opus-5.5':'meta-llama/llama-4-maverick';jury+=seat(mod,i,o)}
    var proof=prove?n*(0.0052+0.0048):0;
    var screen=jev?Math.max(0.0004,4.2e-8*i):0;
    var per=screen+(jev?esc:1)*(jury+proof);
    var bytes=$('c_acct').value==='fixed'?6293:1952;
    var rentRul=(bytes+HDR)*RPB/1e9, rentRulUsd=rentRul*SOL*(jev?1+esc:1); // a screen is its own request and ruling under the SIMD as written
    var tFast=jev?'70 to 500 ms':'n/a', tFull=prove?'minutes':'20 to 60 s';
    $('c_res').innerHTML=
      '<div><span>Model cost, jury only</span><b>$'+(jury+proof).toFixed(4)+'</b></div>'+
      '<div><span>Model cost per request'+(jev?', with Jev':'')+'</span><b>$'+per.toFixed(4)+'</b></div>'+
      '<div><span>Per month, model calls</span><b>$'+(per*m).toLocaleString('en-US',{maximumFractionDigits:2})+'</b></div>'+
      '<div><span>Time, settled by the screen</span><b>'+tFast+'</b></div>'+
      '<div><span>Time, escalated</span><b>'+tFull+'</b></div>'+
      '<div><span>Ruling account rent, per ruling</span><b>'+rentRul.toFixed(4)+' SOL</b></div>'+
      '<div><span>Ruling rent per month'+(jev?' (screens and escalations)':'')+'</span><b>$'+(rentRulUsd*m).toLocaleString('en-US',{maximumFractionDigits:0})+'</b></div>'+
      '<p class="dim" style="font-size:13px;margin:10px 0 0">'+(t==='mav'&&!prove?'Maverick without proofs is just one open model on every seat. ':'')+(prove&&t!=='mav'?'Proofs exist today only for Llama 4 Maverick; with other models this is hypothetical. ':'')+(jev?'Screened cases get no opinion, sources or jury signatures.':'')+'</p>';
  }
  document.querySelectorAll('.calc input,.calc select').forEach(function(e){e.addEventListener('input',calc);e.addEventListener('change',calc)});
  calc();
  }, []);
  return null;
}
