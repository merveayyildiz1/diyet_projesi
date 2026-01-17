import 'package:flutter/material.dart';


class WelcomeButton extends StatelessWidget{
  const WelcomeButton({super.key, this.buttonText, this.onTap, this.color, this.textColor, this.borderColor});
  final String? buttonText;
  final Widget? onTap;
  final Color? color;
  final Color? textColor;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (e) => onTap! ,
            ),
          );
      },
      child: Container(
        padding: EdgeInsets.all(30.0),
        decoration: BoxDecoration(
          color: color ?? Colors.white,
          border: borderColor !=null 
          ? Border.all(color: borderColor!, width: 2.0) 
          : null,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(60),
            topRight: Radius.circular(60),
          ),
        ),
        child: Text(
          buttonText ?? '',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
            color: textColor ?? const Color.fromARGB(255, 81, 132, 81),
          ),
        ),
      ),
    );
  }
}
 

