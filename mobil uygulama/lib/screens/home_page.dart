import 'package:flutter/material.dart';
import 'package:flutter_application_2/screens/signin.dart';
import 'package:flutter_application_2/screens/signup.dart';
import 'package:flutter_application_2/widgets/custom_scaffold.dart';
import 'package:flutter_application_2/widgets/welcome_button.dart';


class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key});


  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      child: Column(
        children: [
          Flexible(
            flex: 8,
            child: Container(
              padding: EdgeInsets.symmetric(
                vertical: 100.0,
                horizontal: 40.0,
                ),
              child: RichText(
                textAlign: TextAlign.center,
                text: const TextSpan(
                  children: [
                    TextSpan(
                      text: 'Welcome to My App\n',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    TextSpan(
                      text: 'This is the home page.',
                      style: TextStyle(
                        fontSize: 20,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
            ),),
          Flexible(
            flex: 12,
            child: Align(
              alignment: Alignment.bottomRight,
              child: Row(
  
                children: [
                  Expanded(
                    
                    child: WelcomeButton(
                      buttonText: 'Sign in',
                      onTap: const SignInPage(),
                      color: const Color.fromARGB(255, 165, 193, 132),
                      textColor: Colors.white,
                    ),
                  ),
                  Expanded(
                    child: WelcomeButton(
                      buttonText: 'Sign up',
                      onTap: const SignUpPage(),
                      color: Colors.white,
                      textColor: Color.fromARGB(255, 1, 76, 30),
            
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),

    );

  }
}